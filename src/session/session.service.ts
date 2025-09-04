import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { JwtService } from '../lib/jwt/jwt.service';
import { WebsocketService } from '../websocket/websocket.service';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private websocket: WebsocketService,
  ) { }


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

    this.websocket.addUserToSession(playerId, session.id.toString());


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




  async getSessionWithPhasesAndQuestions(sessionId: number) {
    return this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        gameFormat: {
          include: {
            phases: {
              include: {
                questions: true, // include all questions in each phase
              },
              orderBy: { order: 'asc' } // sort phases in correct order
            }
          }
        }
      }
    });
  }


  async addPlayerToSession(userId: number, sessionId: number) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const existing = await this.prisma.playerSession.findFirst({
      where: { playerId: userId, sessionId },
    });

    let message: string;
    if (existing) {
      message = 'User already in session';
    } else {
      await this.prisma.playerSession.create({
        data: { playerId: userId, sessionId },
      });
      message = 'Player added to session successfully';
    }

    // Optional: include remaining time if session is active or paused
    let remainingTime = 0;
    if (session.status === 'ACTIVE' || session.status === 'PAUSED') {
      let elapsed = session.elapsedTime;
      if (session.status === 'ACTIVE' && session.startedAt) {
        const now = new Date();
        elapsed += Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
      }
      remainingTime = Math.max(session.duration - elapsed, 0);
    }

    return {
      sessionId,
      message,
      readyToJoin: true,
      remainingTime,
    };
  }


  async getSessionProgress(sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        gameFormat: {
          include: {
            phases: {
              select: {
                id: true,
                name: true,
                order: true,
                timeDuration: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!session) throw new NotFoundException(`Session ${sessionId} not found`)

    // Compute elapsed time
    let totalElapsed = session.elapsedTime
    if (session.status === 'ACTIVE' && session.startedAt) {
      totalElapsed += (Date.now() - session.startedAt.getTime()) / 1000
    }

    // Track current phase
    let phaseStart = 0
    let currentPhase: {
      id: string
      name: string
      order: number
      duration: number
      elapsed: number
      remaining: number
    } | null = null

    for (const phase of session.gameFormat.phases) {
      const phaseEnd = phaseStart + phase.timeDuration
      if (totalElapsed < phaseEnd) {
        currentPhase = {
          id: phase.id,
          name: phase.name,
          order: phase.order,
          duration: phase.timeDuration,
          elapsed: totalElapsed - phaseStart,
          remaining: phaseEnd - totalElapsed,
        }
        break
      }
      phaseStart = phaseEnd
    }

    return {
      id: session.id,
      status: session.status,
      totalElapsed: Math.floor(totalElapsed),
      totalDuration: session.duration,
      gameFormat: {
        id: session.gameFormat.id,
        name: session.gameFormat.name,
        description: session.gameFormat.description,
        totalPhases: session.gameFormat.phases.length,
        phases: session.gameFormat.phases,
      },
      currentPhase,
    }
  }


  async autoJoinSession(playerId: number, sessionId: number) {
    // Find session
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    // Only allow join if session is ACTIVE or PAUSED
    if (session.status !== 'ACTIVE' && session.status !== 'PAUSED') {
      throw new BadRequestException('Session is not joinable');
    }

    // Check if player already joined
    const existing = await this.prisma.playerSession.findFirst({
      where: { playerId, sessionId },
    });

    if (!existing) {
      await this.prisma.playerSession.create({
        data: { playerId, sessionId },
      });
    }

    // Compute remaining time
    let elapsed = session.elapsedTime;
    if (session.status === 'ACTIVE' && session.startedAt) {
      elapsed += Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
    }
    const remainingTime = Math.max(session.duration - elapsed, 0);

    return {
      sessionId,
      message: existing ? 'Player already joined' : 'Joined successfully',
      remainingTime,
    };
  }


}
