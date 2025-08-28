import { Injectable, NotFoundException ,BadRequestException} from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { JwtService } from '../lib/jwt/jwt.service';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}


  async createSession(userId: number, gameFormatId: number, duration: number) {
    const joinCode = this.jwt.sign({ gameFormatId, createdById: userId });

    return this.prisma.session.create({
      data: {
        gameFormatId,
        createdById: userId,
        joinCode,
        duration,
        status: 'PENDING',
        elapsedTime: 0,
      },
    });
  }

  // Start session
  async startSession(sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'ACTIVE') throw new Error('Session already active');

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ACTIVE', startedAt: new Date(), pausedAt: null },
    });
  }


  async pauseSession(sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'ACTIVE') throw new Error('Session not active');

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
    if (!session || session.status !== 'PAUSED') throw new Error('Session not paused');

    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ACTIVE', startedAt: new Date(), pausedAt: null },
    });
  }


async checkAutoComplete(sessionId: number) {
  const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new NotFoundException('Session not found');
  }

  const now = new Date();
  const activeElapsed = session.startedAt
    ? Math.floor((now.getTime() - session.startedAt.getTime()) / 1000)
    : 0;

  const totalElapsed = session.elapsedTime + activeElapsed;

  // If session already completed
  if (session.status === 'COMPLETED') {
    return {
      id: session.id,
      status: 'COMPLETED',
      remainingTime: 0,
      endedAt: session.endedAt,
    };
  }

  // Auto complete if duration reached
  if (totalElapsed >= session.duration) {
    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        elapsedTime: session.duration,
        endedAt: now,
        startedAt: null,
      },
    });
    return {
      id: updated.id,
      status: updated.status,
      remainingTime: 0,
      endedAt: updated.endedAt,
    };
  }


  if (session.status === 'ACTIVE') {
    return {
      id: session.id,
      status: 'ACTIVE',
      remainingTime: session.duration - totalElapsed,
      startedAt: session.startedAt,
    };
  }


  if (session.status === 'PAUSED') {
    return {
      id: session.id,
      status: 'PAUSED',
      remainingTime: session.duration - session.elapsedTime,
      pausedAt: now,
    };
  }

  return {
    id: session.id,
    status: session.status,
    remainingTime: session.duration - totalElapsed,
  };
}


 
  async getRemainingTime(sessionId: number): Promise<number> {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    let elapsed = session.elapsedTime;
    if (session.status === 'ACTIVE' && session.startedAt) {
      const now = new Date();
      elapsed += Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
    }

    return Math.max(session.duration - elapsed, 0);
  }


  async joinSession(playerId: number, joinCode: string) {
  const session = await this.prisma.session.findUnique({
    where: { joinCode },
  });

  if (!session) {
    throw new NotFoundException('Session not found');
  }

  if (session.status !== 'ACTIVE') {
    throw new BadRequestException('Session is not active');
  }


  const existing = await this.prisma.playerSession.findFirst({
    where: { playerId, sessionId: session.id },
  });

  if (!existing) {
    await this.prisma.playerSession.create({
      data: {
        playerId,
        sessionId: session.id,
      },
    });
  }


  const remainingTime = await this.getRemainingTime(session.id);

  return {
    message: 'Joined successfully',
    sessionId: session.id,
    remainingTime,
  };
}







async getPlayersInSession(sessionId: number) {
  const players = await this.prisma.playerSession.findMany({
    where: { sessionId },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  return players.map(p => ({
    playerId: p.player.id,
    name: p.player.name,
    email: p.player.email,
    joinedAt: p.joinedAt,
  }));
}



}
