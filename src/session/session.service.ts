import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { JwtService } from '../lib/jwt/jwt.service';
import { WebsocketService } from '../websocket/websocket.service';
import { CreateSessionDto } from './dto/create-session.dto';
import * as crypto from 'crypto'
import { PhaseStatus } from '@prisma/client'

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private websocket: WebsocketService
  ) {}



async createSession(dto: CreateSessionDto) {
  const joinCode = crypto.randomBytes(3).toString('hex')
  const joiningLink = `https://your-app.com/join/${joinCode}`

  return this.prisma.session.create({
    data: {
      gameFormatId: dto.gameFormatId,
      createdById: dto.userId,
      joinCode,
      joiningLink,
      description: dto.description,
      duration: dto.duration,
      status: dto.startedAt ? 'PENDING' : 'ACTIVE',
      elapsedTime: 0,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
    },
  })
}



async startSession(sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      phaseSessions: { include: { phase: true } },
      gameFormat: { include: { phases: { orderBy: { order: 'asc' } } } }
    }
  });

  if (!session) throw new NotFoundException('Session not found');
  if (session.status === 'ACTIVE') throw new BadRequestException('Session already active');

  await this.prisma.session.update({
    where: { id: sessionId },
    data: { status: 'ACTIVE', startedAt: new Date(), pausedAt: null }
  });

  const phases = session.gameFormat.phases;

  const startPhase = async (phaseIndex: number) => {
    if (phaseIndex >= phases.length) {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { status: 'COMPLETED', endedAt: new Date() }
      });

      const incompletePhases = await this.prisma.phaseSession.findMany({
        where: { sessionId, status: { not: 'COMPLETED' } }
      });

      for (const ps of incompletePhases) {
        await this.prisma.phaseSession.update({
          where: { id: ps.id },
          data: { status: 'COMPLETED', endedAt: new Date() }
        });
      }

      return;
    }

    let phaseSession = await this.prisma.phaseSession.findFirst({
      where: { sessionId, phaseId: phases[phaseIndex].id }
    });

    if (!phaseSession) {
      phaseSession = await this.prisma.phaseSession.create({
        data: {
          sessionId: session.id,
          phaseId: phases[phaseIndex].id,
          status: 'ACTIVE',
          startedAt: new Date(),
          timeDuration: phases[phaseIndex].timeDuration,
          elapsedTime: 0
        },
        include: { phase: true }
      });
    } else {
      phaseSession = await this.prisma.phaseSession.update({
        where: { id: phaseSession.id },
        data: { status: 'ACTIVE', startedAt: new Date(), pausedAt: null },
        include: { phase: true }
      });
    }

    const remainingTime = phaseSession.timeDuration - (phaseSession.elapsedTime || 0);

    setTimeout(async () => {
      await this.prisma.phaseSession.update({
        where: { id: phaseSession.id },
        data: { status: 'COMPLETED', endedAt: new Date() },
        include: { phase: true }
      });

      startPhase(phaseIndex + 1);
    }, remainingTime * 1000);
  };

  startPhase(0);

  return { message: 'Session started. Phases will auto-complete in order.' };
}






async pauseSession(sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: { phaseSessions: true }
  });

  if (!session || session.status !== 'ACTIVE') throw new BadRequestException('Session not active');

  const now = new Date();
  const sessionElapsed = session.startedAt ? Math.floor((now.getTime() - session.startedAt.getTime()) / 1000) : 0;

  await this.prisma.session.update({
    where: { id: sessionId },
    data: { status: 'PAUSED', elapsedTime: session.elapsedTime + sessionElapsed, pausedAt: now, startedAt: null }
  });

  const activePhase = session.phaseSessions.find(ps => ps.status === 'ACTIVE');
  if (activePhase && activePhase.startedAt) {
    const phaseElapsed = Math.floor((now.getTime() - activePhase.startedAt.getTime()) / 1000);
    await this.prisma.phaseSession.update({
      where: { id: activePhase.id },
      data: { status: 'PAUSED', elapsedTime: (activePhase.elapsedTime || 0) + phaseElapsed, pausedAt: now, startedAt: null }
    });
  }

  return { message: 'Session and active phase paused successfully' };
}

async resumeSession(sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: { phaseSessions: true }
  });

  if (!session || session.status !== 'PAUSED') throw new BadRequestException('Session not paused');

  const now = new Date();

  await this.prisma.session.update({
    where: { id: sessionId },
    data: { status: 'ACTIVE', startedAt: now, pausedAt: null }
  });

  const pausedPhase = session.phaseSessions.find(ps => ps.status === 'PAUSED');
  if (pausedPhase) {
    await this.prisma.phaseSession.update({
      where: { id: pausedPhase.id },
      data: { status: 'ACTIVE', startedAt: now, pausedAt: null }
    });
  }

  return { message: 'Session and paused phase resumed successfully' };
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
  const session = await this.prisma.session.findUnique({ where: { joinCode } })
  if (!session) throw new NotFoundException('Session not found')

  if (session.status === 'COMPLETED') {
    throw new BadRequestException('Session is already completed')
  }

  const existing = await this.prisma.playerSession.findFirst({
    where: { playerId, sessionId: session.id },
  })

  if (!existing) {
    await this.prisma.playerSession.create({
      data: { playerId, sessionId: session.id },
    })
  }

  this.websocket.addUserToSession(playerId, session.id.toString())

  const response = {
    message: session.status === 'PENDING' || session.status === 'PAUSED'
      ? 'Joined successfully, session not active yet'
      : 'Joined successfully',
    status: session.status,
    sessionId: session.id,
    gameFormatId: session.gameFormatId,
    joiningLink: session.joiningLink,
  }

  return response
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
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      phaseSessions: { include: { phase: true } },
      gameFormat: { include: { phases: { orderBy: { order: 'asc' } } } }
    }
  });

  if (!session) throw new NotFoundException('Session not found');

  const now = new Date().getTime();

  const phases = session.gameFormat.phases.map(phase => {
    let phaseSession = session.phaseSessions.find(ps => ps.phaseId === phase.id);

    let status = 'PENDING';
    let elapsedTime = 0;
    let remainingTime = phase.timeDuration;

    if (phaseSession) {
      status = phaseSession.status;

      if (status === 'ACTIVE' && phaseSession.startedAt) {
        elapsedTime = Math.floor((now - phaseSession.startedAt.getTime()) / 1000) + (phaseSession.elapsedTime || 0);
        remainingTime = Math.max(phase.timeDuration - elapsedTime, 0);
      } else if (status === 'COMPLETED') {
        elapsedTime = phase.timeDuration;
        remainingTime = 0;
      } else {
        elapsedTime = phaseSession.elapsedTime || 0;
        remainingTime = Math.max(phase.timeDuration - elapsedTime, 0);
      }
    }

    return {
      phaseId: phase.id,
      name: phase.name,
      description: phase.description,
      order: phase.order,
      status,
      totalTime: phase.timeDuration,
      elapsedTime,
      remainingTime
    };
  });

  const totalTime = phases.reduce((acc, p) => acc + (p.totalTime || 0), 0);
  const totalRemainingTime = phases.reduce((acc, p) => acc + (p.remainingTime || 0), 0);

  return {
    sessionId: session.id,
    status: session.status,
    totalTime,
    totalRemainingTime,
    phases
  };
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


async getSessionDetail(sessionId: number) {
  const [session, totalPlayers] = await Promise.all([
    this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        description: true,
        joinCode: true,
        joiningLink: true,
        status: true,
        duration: true,
        createdAt: true,
        gameFormat: {
          select: {
            description: true,
            facilitators: {
              select: { id: true, name: true, email: true, role: true }
            },
            phases: { select: { id: true } }
          }
        },
        createdBy: {
          select: { id: true, name: true, email: true ,role:true }
        }
      }
    }),
    this.prisma.playerSession.count({ where: { sessionId } })
  ])

  if (!session) throw new NotFoundException('Session not found')

  const totalPhases = session.gameFormat.phases.length

  return {
    id: session.id,
    description: session.gameFormat.description,
    sessionTitle: session.description,
    joinCode: session.joinCode,
    joinLink: session.joiningLink,
    status: session.status,
    totalPlayers,
    totalPhases,
    createdBy: session.createdBy,
    facilitators: session.gameFormat.facilitators,
    createdAt: session.createdAt
  }
}







async getAllSessions() {
  const sessions = await this.prisma.session.findMany({
    include: {
      gameFormat: { include: { phases: true } },
      players: true
    },
    orderBy: { startedAt: 'asc' }
  })

  const scheduledSessions = sessions
    .filter(s => s.status === 'PENDING')
    .map(s => ({
      id: s.id,
      description: s.gameFormat.description,
      sessiontitle: s.description,
      totalPlayers: s.players.length,
      totalPhases: s.gameFormat.phases.length,
      startTime: s.startedAt
    }))

  const activeSessions = sessions
    .filter(s => s.status === 'ACTIVE' || s.status === 'PAUSED')
    .map(s => ({
      id: s.id,
      description: s.gameFormat.description,
      sessiontitle: s.description,
      totalPlayers: s.players.length,
      totalPhases: s.gameFormat.phases.length,
      status: s.status
    }))

  return { scheduledSessions, activeSessions }
}




async getSessionsForFacilitator(facilitatorId: number) {
  const sessions = await this.prisma.session.findMany({
    include: {
      gameFormat: {
        include: {
          phases: true,
          facilitators: true
        }
      },
      players: true
    },
    orderBy: { startedAt: 'asc' }
  })

  // Filter sessions where the facilitator is part of the game format
  const facilitatorSessions = sessions.filter(s =>
    s.gameFormat.facilitators.some(f => f.id === facilitatorId)
  )

  const scheduledSessions = facilitatorSessions
    .filter(s => s.status === 'PENDING')
    .map(s => ({
      id: s.id,
      description: s.gameFormat.description,
      sessiontitle: s.description,
      totalPlayers: s.players.length,
      totalPhases: s.gameFormat.phases.length,
      startTime: s.startedAt
    }))

  const activeSessions = facilitatorSessions
    .filter(s => s.status === 'ACTIVE' || s.status === 'PAUSED')
    .map(s => ({
      id: s.id,
      description: s.gameFormat.description,
      sessiontitle: s.description,
      totalPlayers: s.players.length,
      totalPhases: s.gameFormat.phases.length,
      status: s.status,
      remainingTime: s.duration - s.elapsedTime
    }))

  return { scheduledSessions, activeSessions }
}

async getAllSessionsWithCode() {
  const sessions = await this.prisma.session.findMany({
    include: {
      gameFormat: { include: { phases: true } },
      players: true
    },
    orderBy: { startedAt: 'asc' }
  })

  const scheduledSessions = sessions
    .filter(s => s.status === 'PENDING')
    .map(s => ({
      id: s.id,
      description: s.gameFormat.description,
      sessiontitle: s.description,
      totalPlayers: s.players.length,
      totalPhases: s.gameFormat.phases.length,
      startTime: s.startedAt,
      joinCode: s.joinCode
    }))

  const activeSessions = sessions
    .filter(s => s.status === 'ACTIVE' || s.status === 'PAUSED')
    .map(s => ({
      id: s.id,
      description: s.gameFormat.description,
      sessiontitle: s.description,
      totalPlayers: s.players.length,
      totalPhases: s.gameFormat.phases.length,
      joinCode: s.joinCode,
      status: s.status
    }))

  return { scheduledSessions, activeSessions }
}



async completeSession(sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: { phaseSessions: true }
  });

  if (!session) throw new NotFoundException('Session not found');
  if (session.status === 'COMPLETED') throw new BadRequestException('Session already completed');

  const now = new Date();

  await this.prisma.session.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED', elapsedTime: session.duration, endedAt: now, startedAt: null, pausedAt: null }
  });

  const incompletePhases = session.phaseSessions.filter(ps => ps.status !== 'COMPLETED');

  for (const ps of incompletePhases) {
    await this.prisma.phaseSession.update({
      where: { id: ps.id },
      data: { status: 'COMPLETED', elapsedTime: ps.timeDuration, endedAt: now, startedAt: null, pausedAt: null }
    });
  }

  return { message: 'Session and all phases completed successfully' };
}


}
