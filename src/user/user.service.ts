import { Injectable, BadRequestException ,NotFoundException} from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        createdTeams: true,
        gameFormats: true
      }
    })

    if (!user) throw new BadRequestException('User not found')

    return user
  }

  async updateUser(userId: number, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) throw new BadRequestException('User not found')

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        language: data.language,
        role: data.role
      }
    })
  }




  async getUserStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: true, joinedSessions: true, createdTeams: true, gameFormats: true }
    })

    if (!user) throw new BadRequestException('User not found')
    if (user.role?.toLowerCase() !== 'player') throw new BadRequestException('User is not a player')

    const playerInfo = { id: user.id, name: user.name, email: user.email }

    const playerSessions = await this.prisma.playerSession.findMany({
      where: { playerId: userId },
      include: {
        session: {
          include: {
            players: { include: { player: true } },
            gameFormat: { include: { phases: true } }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    const allScores = await this.prisma.score.findMany({
      where: { sessionId: { in: playerSessions.map(ps => ps.sessionId) } }
    })

    const avgScore = allScores.length
      ? allScores.reduce((sum, s) => sum + s.finalScore, 0) / allScores.length
      : 0

    const totalMVP = await this.calculateMVPCount(playerSessions.map(ps => ps.sessionId), allScores)

    const sessionStats = { totalSessions: playerSessions.length, avgScore, totalMVP }

    const recentSessions = await Promise.all(playerSessions.slice(0, 5).map(async ps => {
      const session = ps.session

      const sessionScores = await this.prisma.score.findMany({
        where: { sessionId: session.id }
      })

      const sortedScores = sessionScores.map(s => s.finalScore).sort((a, b) => b - a)
      const playerScore = sessionScores.find(s => s.playerId === userId)?.finalScore || 0
      const rank = sortedScores.indexOf(playerScore) + 1

      return {
        sessionId: session.id,
        sessionName: session.gameFormat.name,
        sessionDescription: session.description,
        totalPhases: session.gameFormat.phases.length,
        totalPlayers: session.players.length,
        status: session.status,
        rank
      }
    }))

    return { playerInfo, sessionStats, user, recentSessions }
  }

  private async calculateMVPCount(sessionIds: number[], scores: any[]) {
    let totalMVP = 0
    for (const sessionId of sessionIds) {
      const sessionScores = scores.filter(s => s.sessionId === sessionId)
      const maxScore = Math.max(...sessionScores.map(s => s.finalScore))
      const playerScore = sessionScores[0]?.playerId ? sessionScores.find(s => s.playerId === sessionScores[0].playerId)?.finalScore : 0
      if (playerScore === maxScore) totalMVP++
    }
    return totalMVP
  }

 async getFacilitatorStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: true, joinedSessions: true, createdTeams: true, gameFormats: true }
    })

  if (!user) throw new BadRequestException('User not found')

const role = user.role?.toLowerCase()
if (role !== 'facilitator' && role !== 'admin') {
  throw new BadRequestException('Access denied, only facilitator or admin allowed')
}

    const playerInfo = { id: user.id, name: user.name, email: user.email }

    const facilitatorSessions = await this.prisma.session.findMany({
      where: { createdById: userId },
      include: {
        players: true,
        gameFormat: { include: { phases: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalPlayers = facilitatorSessions.reduce((sum, s) => sum + s.players.length, 0)
    const completedSessions = facilitatorSessions.filter(s => s.status === 'COMPLETED').length
    const successRate = facilitatorSessions.length ? (completedSessions / facilitatorSessions.length) * 100 : 0

    const sessionStats = {
      totalSessions: facilitatorSessions.length,
      totalManagePlayer: totalPlayers,
      successRate
    }

    const recentSessions = facilitatorSessions.slice(0, 5).map(session => ({
      sessionId: session.id,
      sessionName: session.gameFormat.name,
      sessionDescription: session.description,
      totalPhases: session.gameFormat.phases.length,
      totalPlayers: session.players.length,
      status: session.status
    }))

    return { playerInfo, sessionStats, user, recentSessions }
  }

async toggleSuspend(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) throw new BadRequestException('User not found')

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        suspended: !user.suspended
      }
    })

    return {
      id: updatedUser.id,
      suspended: updatedUser.suspended,
      message: updatedUser.suspended ? 'User suspended' : 'User unsuspended'
    }
  }


 async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) throw new NotFoundException({ message: 'User not found' })

    await this.prisma.user.delete({
      where: { id: userId }
    })

    return { message: 'User account and all related data deleted successfully' }
  }


}