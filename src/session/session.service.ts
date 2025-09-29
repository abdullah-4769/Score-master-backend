import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { JwtService } from '../lib/jwt/jwt.service';
import { WebsocketService } from '../websocket/websocket.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private websocket: WebsocketService
  ) {}

async createSession(dto: CreateSessionDto) {
  const joinCode = this.jwt.sign({ gameFormatId: dto.gameFormatId, createdById: dto.userId });
  const joiningLink = `https://your-app.com/join/${joinCode}`;

  return this.prisma.session.create({
    data: {
      gameFormatId: dto.gameFormatId,
      createdById: dto.userId,
      joinCode,
      joiningLink,
      description: dto.description,
      duration: dto.duration,
      status: dto.startedAt ? 'ACTIVE' : 'PENDING',
      elapsedTime: 0,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
    },
  });
}


  async startSession(sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'ACTIVE') throw new BadRequestException('Session already active');
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ACTIVE', startedAt: new Date(), pausedAt: null },
    });
  }

  async pauseSession(sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'ACTIVE') throw new BadRequestException('Session not active');

    const now = new Date();
    const diff = session.startedAt ? Math.floor((now.getTime() - session.startedAt.getTime()) / 1000) : 0;
    const newElapsed = session.elapsedTime + diff;

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'PAUSED', elapsedTime: newElapsed, pausedAt: now, startedAt: null },
    });
  }

  async resumeSession(sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'PAUSED') throw new BadRequestException('Session not paused');
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ACTIVE', startedAt: new Date(), pausedAt: null },
    });
  }

  async checkAutoComplete(sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const now = new Date();
    const activeElapsed = session.startedAt ? Math.floor((now.getTime() - session.startedAt.getTime()) / 1000) : 0;
    const totalElapsed = session.elapsedTime + activeElapsed;

    if (session.status === 'COMPLETED') return { id: session.id, status: 'COMPLETED', remainingTime: 0, endedAt: session.endedAt };
    if (totalElapsed >= session.duration) {
      const updated = await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED', elapsedTime: session.duration, endedAt: now, startedAt: null },
      });
      return { id: updated.id, status: updated.status, remainingTime: 0, endedAt: updated.endedAt };
    }

    if (session.status === 'ACTIVE') return { id: session.id, status: 'ACTIVE', remainingTime: session.duration - totalElapsed, startedAt: session.startedAt };
    if (session.status === 'PAUSED') return { id: session.id, status: 'PAUSED', remainingTime: session.duration - session.elapsedTime, pausedAt: now };
    return { id: session.id, status: session.status, remainingTime: session.duration - totalElapsed };
  }

  async getRemainingTime(sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    let elapsed = session.elapsedTime;
    if (session.status === 'ACTIVE' && session.startedAt) {
      elapsed += Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
    }
    return Math.max(session.duration - elapsed, 0);
  }

  async joinSession(playerId: number, joinCode: string) {
    const session = await this.prisma.session.findUnique({ where: { joinCode } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'ACTIVE') throw new BadRequestException('Session is not active');

    const existing = await this.prisma.playerSession.findFirst({ where: { playerId, sessionId: session.id } });
    if (!existing) await this.prisma.playerSession.create({ data: { playerId, sessionId: session.id } });
    this.websocket.addUserToSession(playerId, session.id.toString());

    const remainingTime = await this.getRemainingTime(session.id);
    return { message: 'Joined successfully', sessionId: session.id, remainingTime, joiningLink: session.joiningLink };
  }

  async getPlayersInSession(sessionId: number) {
    const players = await this.prisma.playerSession.findMany({
      where: { sessionId },
      include: { player: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: 'asc' },
    });
    return players.map(p => ({ playerId: p.player.id, name: p.player.name, email: p.player.email, joinedAt: p.joinedAt }));
  }

  async getSessionWithPhasesAndQuestions(sessionId: number) {
    return this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { gameFormat: { include: { phases: { include: { questions: true }, orderBy: { order: 'asc' } } } } },
    });
  }

  async addPlayerToSession(userId: number, sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const existing = await this.prisma.playerSession.findFirst({ where: { playerId: userId, sessionId } });
    if (existing) return { sessionId, message: 'User already in session', readyToJoin: true, remainingTime: await this.getRemainingTime(sessionId) };

    await this.prisma.playerSession.create({ data: { playerId: userId, sessionId } });
    return { sessionId, message: 'Player added to session successfully', readyToJoin: true, remainingTime: await this.getRemainingTime(sessionId) };
  }

  async getSessionProgress(sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId }, include: { gameFormat: { include: { phases: { orderBy: { order: 'asc' }, select: { id: true, name: true, order: true, timeDuration: true } } } } } });
    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);

    let totalElapsed = session.elapsedTime;
    if (session.status === 'ACTIVE' && session.startedAt) totalElapsed += (Date.now() - session.startedAt.getTime()) / 1000;

    let phaseStart = 0;
    let currentPhase: any = null;
    for (const phase of session.gameFormat.phases) {
      const phaseEnd = phaseStart + phase.timeDuration;
      if (totalElapsed < phaseEnd) {
        currentPhase = { id: phase.id.toString(), name: phase.name, order: phase.order ?? 0, duration: phase.timeDuration, elapsed: totalElapsed - phaseStart, remaining: phaseEnd - totalElapsed };
        break;
      }
      phaseStart = phaseEnd;
    }

    return { id: session.id, status: session.status, totalElapsed: Math.floor(totalElapsed), totalDuration: session.duration, gameFormat: { id: session.gameFormat.id, name: session.gameFormat.name, description: session.gameFormat.description, totalPhases: session.gameFormat.phases.length, phases: session.gameFormat.phases }, currentPhase };
  }

  async autoJoinSession(playerId: number, sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'ACTIVE' && session.status !== 'PAUSED') throw new BadRequestException('Session is not joinable');

    const existing = await this.prisma.playerSession.findFirst({ where: { playerId, sessionId } });
    if (!existing) await this.prisma.playerSession.create({ data: { playerId, sessionId } });

    let elapsed = session.elapsedTime;
    if (session.status === 'ACTIVE' && session.startedAt) elapsed += Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
    const remainingTime = Math.max(session.duration - elapsed, 0);

    return { sessionId, message: existing ? 'Player already joined' : 'Joined successfully', remainingTime };
  }
}
