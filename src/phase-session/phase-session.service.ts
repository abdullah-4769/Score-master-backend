import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { CreatePhaseSessionDto } from './dto/create-phase-session.dto';

@Injectable()
export class PhaseSessionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePhaseSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      include: { gameFormat: { include: { phases: { orderBy: { order: 'asc' } } } } },
    });

    if (!session) throw new NotFoundException('Session not found');

    const phases = session.gameFormat.phases;
    if (!phases || phases.length === 0) throw new BadRequestException('No phases found for this game format');

    const phaseSessions = await Promise.all(
      phases.map(phase =>
        this.prisma.phaseSession.create({
          data: {
            sessionId: dto.sessionId,
            phaseId: phase.id,
            timeDuration: phase.timeDuration,
          },
        }),
      ),
    );

    return phaseSessions;
  }

  async toggle(phaseSessionId: number) {
    const phase = await this.prisma.phaseSession.findUnique({
      where: { id: phaseSessionId },
      include: { session: true }, // important for type safety
    });

    if (!phase) throw new NotFoundException('Phase session not found');
    if (phase.status === 'COMPLETED') throw new BadRequestException('Phase is already completed');
    if (!phase.session) throw new BadRequestException('Parent session not found');

    const now = new Date();

    // Auto-pause if parent session is not active
    if (phase.session.status !== 'ACTIVE' && phase.status === 'ACTIVE') {
      const elapsed = phase.startedAt ? Math.floor((now.getTime() - phase.startedAt.getTime()) / 1000) : 0;
      const updatedPhase = await this.prisma.phaseSession.update({
        where: { id: phaseSessionId },
        data: {
          status: 'PAUSED',
          elapsedTime: phase.elapsedTime + elapsed,
          pausedAt: now,
          startedAt: null,
        },
        include: { session: true }, // keep session for type safety
      });
      return updatedPhase;
    }

    if (phase.status === 'ACTIVE') {
      const elapsed = phase.startedAt ? Math.floor((now.getTime() - phase.startedAt.getTime()) / 1000) : 0;
      const updatedPhase = await this.prisma.phaseSession.update({
        where: { id: phaseSessionId },
        data: {
          status: 'PAUSED',
          elapsedTime: phase.elapsedTime + elapsed,
          pausedAt: now,
          startedAt: null,
        },
        include: { session: true },
      });
      return updatedPhase;
    } else if (phase.status === 'PAUSED') {
      if (phase.session.status !== 'ACTIVE') {
        throw new BadRequestException('Cannot resume while parent session is paused');
      }
      const updatedPhase = await this.prisma.phaseSession.update({
        where: { id: phaseSessionId },
        data: {
          status: 'ACTIVE',
          startedAt: now,
          pausedAt: null,
        },
        include: { session: true },
      });
      return updatedPhase;
    } else {
      throw new BadRequestException('Phase cannot be toggled from current status');
    }
  }

async getStatus(phaseSessionId: number) {
  const phase = await this.prisma.phaseSession.findUnique({
    where: { id: phaseSessionId },
    include: { session: true },
  })

  if (!phase) throw new NotFoundException('Phase session not found')

  const now = new Date()
  let liveElapsed = phase.elapsedTime

  if (phase.status === 'ACTIVE' && phase.startedAt) {
    liveElapsed += Math.floor((now.getTime() - phase.startedAt.getTime()) / 1000)
  }

  let remainingTime = phase.timeDuration - liveElapsed
  if (remainingTime < 0) remainingTime = 0

  return {
    ...phase,
    elapsedTime: liveElapsed,
    remainingTime,
  }
}



async start(phaseSessionId: number) {
  const phase = await this.prisma.phaseSession.findUnique({
    where: { id: phaseSessionId },
    include: { session: true },
  });

  if (!phase) throw new NotFoundException('Phase session not found');
  if (phase.status === 'COMPLETED') throw new BadRequestException('Phase is already completed');
  if (!phase.session || phase.session.status !== 'ACTIVE') throw new BadRequestException('Parent session is not active');

  const now = new Date();

  if (phase.status === 'ACTIVE') {
    throw new BadRequestException('Phase is already active');
  }

  if (phase.status === 'PAUSED') {
    // Resume the paused phase
    return this.prisma.phaseSession.update({
      where: { id: phaseSessionId },
      data: { status: 'ACTIVE', startedAt: now, pausedAt: null },
      include: { session: true },
    });
  }

  // If phase has not started yet
  return this.prisma.phaseSession.update({
    where: { id: phaseSessionId },
    data: { status: 'ACTIVE', startedAt: now, pausedAt: null },
    include: { session: true },
  });
}



}
