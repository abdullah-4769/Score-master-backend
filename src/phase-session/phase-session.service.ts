import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { CreatePhaseSessionDto } from './dto/create-phase-session.dto';
import { UpdatePhaseSessionDto } from './dto/update-phase-session.dto';

@Injectable()
export class PhaseSessionService {
  constructor(private prisma: PrismaService) {}

 async create(dto: CreatePhaseSessionDto) {
  return this.prisma.phaseSession.create({
    data: {
      sessionId: dto.sessionId,             // number is fine
      phaseId: dto.phaseId.toString(),      // convert to string
      timeDuration: dto.timeDuration,
    },
  });
}


  async start(phaseSessionId: number) {
  const phase = await this.prisma.phaseSession.findUnique({ 
    where: { id: phaseSessionId }, 
    include: { session: true } 
  });

  if (!phase) throw new NotFoundException('Phase session not found');

  // Check if phase is already completed
  if (phase.status === 'COMPLETED') {
    throw new BadRequestException('Phase is already completed. Cannot restart.');
  }

  if (phase.status === 'ACTIVE') throw new BadRequestException('Phase is already active');

  if (!phase.session || phase.session.status !== 'ACTIVE') {
    throw new BadRequestException('Parent session is not active');
  }


  return this.prisma.phaseSession.update({
    where: { id: phaseSessionId },
    data: { 
      status: 'ACTIVE', 
      startedAt: new Date(), 
      pausedAt: null 
    },
  });
}


  async pause(phaseSessionId: number) {
    const phase = await this.prisma.phaseSession.findUnique({ where: { id: phaseSessionId } });
    if (!phase || phase.status !== 'ACTIVE') throw new BadRequestException('Phase is not active');

    const now = new Date();
    const elapsed = phase.startedAt ? Math.floor((now.getTime() - phase.startedAt.getTime()) / 1000) : 0;

    return this.prisma.phaseSession.update({
      where: { id: phaseSessionId },
      data: { status: 'PAUSED', elapsedTime: phase.elapsedTime + elapsed, pausedAt: now, startedAt: null },
    });
  }

async complete(phaseSessionId: number) {
  const phaseSession = await this.prisma.phaseSession.findUnique({
    where: { id: phaseSessionId },
  });

  if (!phaseSession) {
    throw new NotFoundException('Phase session not found');
  }

  // Calculate actual elapsed time
  let elapsed = phaseSession.elapsedTime || 0;
  if (phaseSession.status === 'ACTIVE' && phaseSession.startedAt) {
    elapsed += Math.floor((Date.now() - phaseSession.startedAt.getTime()) / 1000);
  }

  // Update phase session in the database as COMPLETED
  const updatedPhase = await this.prisma.phaseSession.update({
    where: { id: phaseSessionId },
    data: {
      status: 'COMPLETED',      // Mark as completed
      elapsedTime: elapsed,      // Save actual elapsed time
      endedAt: new Date(),       // Set the completion time
      startedAt: null,           // Clear startedAt
      pausedAt: null,            // Clear pausedAt
    },
  });

  return {
    id: updatedPhase.id,
    phaseId: updatedPhase.phaseId,
    sessionId: updatedPhase.sessionId,
    status: updatedPhase.status,
    timeDuration: updatedPhase.timeDuration,
    elapsedTime: updatedPhase.elapsedTime,
    startedAt: updatedPhase.startedAt,
    pausedAt: updatedPhase.pausedAt,
    endedAt: updatedPhase.endedAt,
    createdAt: updatedPhase.createdAt,
    updatedAt: updatedPhase.updatedAt,
  };
}



  async getRemainingTime(phaseSessionId: number) {
    const phase = await this.prisma.phaseSession.findUnique({ where: { id: phaseSessionId } });
    if (!phase) throw new NotFoundException('Phase session not found');

    let elapsed = phase.elapsedTime;
    if (phase.status === 'ACTIVE' && phase.startedAt) {
      elapsed += Math.floor((Date.now() - phase.startedAt.getTime()) / 1000);
    }

    return Math.max(phase.timeDuration - elapsed, 0);
  }




  
 async checkAutoPause(phaseSessionId: number) {
  const phase = await this.prisma.phaseSession.findUnique({
    where: { id: phaseSessionId },
    include: { session: true },
  });

  if (!phase) {
    throw new NotFoundException('Phase session not found');
  }

  if (!phase.session) {
    throw new NotFoundException('Parent session not found');
  }

  // Pause phase if parent session is not active
  if (phase.status === 'ACTIVE' && phase.session.status !== 'ACTIVE') {
    await this.pause(phaseSessionId);
    phase.status = 'PAUSED'; // update local status after pause
  }

  // Calculate remaining time
  let elapsed = phase.elapsedTime;
  if (phase.status === 'ACTIVE' && phase.startedAt) {
    elapsed += Math.floor((Date.now() - phase.startedAt.getTime()) / 1000);
  }
  const remainingTime = Math.max(phase.timeDuration - elapsed, 0);

  return {
    id: phase.id,
    status: phase.status,
    remainingTime,
  };
}


}
