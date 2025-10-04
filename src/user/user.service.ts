import { Injectable } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: number) {
    // Get all player sessions with related session info
    const sessions = await this.prisma.playerSession.findMany({
      where: { playerId: userId },
      include: {
        session: {
          include: {
            players: true,        // to count total players
            phaseSessions: true   // to count total phases
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    // Map recent sessions with extra info
    const recentSessions = sessions.slice(0, 5).map(ps => ({
      id: ps.session.id,
      description: ps.session.description,
      joinCode: ps.session.joinCode,
      status: ps.session.status,
      totalPlayers: ps.session.players.length,
      totalPhases: ps.session.phaseSessions.length,
      joinedAt: ps.joinedAt
    }))

    // Get all scores for user
    const scores = await this.prisma.score.findMany({
      where: { playerId: userId }
    })

    // Average score
    const avgScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s.finalScore, 0) / scores.length
        : 0

    // Total MVPs (highest score in session)
    const mvpSessions = await this.prisma.score.groupBy({
      by: ['sessionId'],
      where: { playerId: userId },
      _max: { finalScore: true }
    })

    const totalMVP = mvpSessions.filter(s =>
      s._max.finalScore === Math.max(...scores.map(sc => sc.finalScore))
    ).length

    // Full user state
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        sessions: true,
        scores: true,
        createdTeams: true,
        joinedSessions: true,
        gameFormats: true
      }
    })

    return {
      avgScore,
      totalMVP,
      user,
      recentSessions
    }
  }
}
