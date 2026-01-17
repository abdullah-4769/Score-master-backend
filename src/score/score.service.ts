import { Injectable,NotFoundException } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'
import { CreateScoreDto } from './dto/create-score.dto'
import { UpdateScoreDto } from './dto/update-score.dto'

@Injectable()
export class ScoreService {
  constructor(private prisma: PrismaService) {}

  // create a new score
  async create(createScoreDto: CreateScoreDto) {
    return this.prisma.score.create({
      data: createScoreDto
    })
  }

  // get score by id
  async findOne(id: number) {
    return this.prisma.score.findUnique({
      where: { id },
      include: {
        player: true,
        question: true,
        session: true,
        phase: true,
      }
    })
  }

  // get all scores for a player
  async findByPlayer(playerId: number) {
    return this.prisma.score.findMany({
      where: { playerId },
      include: {
        question: true,
        session: true,
        phase: true,
      }
    })
  }

  // update score
  async update(id: number, updateScoreDto: UpdateScoreDto) {
    return this.prisma.score.update({
      where: { id },
      data: updateScoreDto
    })
  }

  // delete score
  async remove(id: number) {
    return this.prisma.score.delete({
      where: { id }
    })
  }

  // get scores by question and player
async findByQuestionAndPlayer(questionId: number, playerId: number) {
  return this.prisma.score.findMany({
    where: {
      questionId,
      playerId
    },
    include: {
      player: true,
      question: true,
      session: true,
      phase: true,
    }
  })
}



async getPlayerRanking(sessionId: number) {
  const rankings = await this.prisma.score.groupBy({
    by: ['playerId'],
    where: { sessionId },
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
  })

  const ranked = await Promise.all(rankings.map(async (r, index) => {
    const player = await this.prisma.user.findUnique({
      where: { id: r.playerId },
      select: { id: true, name: true, email: true }
    })
    return {
      rank: index + 1,
      playerId: r.playerId,
      playerName: player?.name,
      playerEmail: player?.email,
      sessionId,
      totalPoints: r._sum.points || 0
    }
  }))

  const top3 = ranked.slice(0, 3)
  const remaining = ranked.slice(3)

  return {
    top3,
    remaining
  }
}

async getSessionRanking(sessionId: number) {
  const rankings = await this.prisma.score.groupBy({
    by: ['sessionId'],
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
  })

  const ranked = await Promise.all(rankings.map(async (r, index) => {
    const session = await this.prisma.session.findUnique({
      where: { id: r.sessionId },
      select: { id: true, description: true }
    })
    return {
      rank: index + 1,
      sessionId: r.sessionId,
      sessionDescription: session?.description,
      totalPoints: r._sum.points || 0
    }
  }))

  const top3 = ranked.slice(0, 3)
  const remaining = ranked.slice(3)

  return {
    top3,
    remaining
  }
}



async getPlayerRankingByPhase(sessionId: number, phaseId: number) {
  const rankings = await this.prisma.score.groupBy({
    by: ['playerId'],
    where: { sessionId, phaseId },
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
  })

  const ranked = await Promise.all(rankings.map(async (r, index) => {
    const player = await this.prisma.user.findUnique({
      where: { id: r.playerId },
      select: { id: true, name: true, email: true },
    })
    return {
      rank: index + 1,
      playerId: r.playerId,
      playerName: player?.name,
      playerEmail: player?.email,
      sessionId,
      phaseId,
      totalPoints: r._sum.points || 0,
    }
  }))

  const top3 = ranked.slice(0, 3)
  const remaining = ranked.slice(3)

  return {
    top3,
    remaining,
  }
}


  async getSessionAnalytics(sessionId: number) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        gameFormat: {
          include: { capabilities: true, phases: true }
        }
      }
    })

    if (!session) throw new NotFoundException('Session not found')

    const gameFormat = session.gameFormat
    const phases = gameFormat.phases
    const capabilities = gameFormat.capabilities[0]

    const scores = await this.prisma.score.findMany({
      where: { sessionId },
      select: { playerId: true, points: true, phaseId: true }
    })

    const playersWithScores = [...new Set(scores.map(s => s.playerId))]
    const activePlayersCount = playersWithScores.length

    const totalPoints = scores.reduce((sum, s) => sum + s.points, 0)
    const avgScore = scores.length > 0 ? totalPoints / scores.length : 0

    const playerTotals = playersWithScores.map(playerId => {
      const playerScores = scores.filter(s => s.playerId === playerId)
      const total = playerScores.reduce((sum, s) => sum + s.points, 0)
      return { playerId, total }
    })

    const sortedPlayers = playerTotals.sort((a, b) => b.total - a.total)
    const topPlayer = sortedPlayers.length
      ? await this.prisma.user.findUnique({
          where: { id: sortedPlayers[0].playerId },
          select: { name: true }
        })
      : null

    const playerRanking = await Promise.all(
      sortedPlayers.map(async (p, index) => {
        const player = await this.prisma.user.findUnique({
          where: { id: p.playerId },
          select: { name: true }
        })
        return {
          rank: index + 1,
          playerName: player?.name,
          totalPoints: p.total
        }
      })
    )

    const phaseBreakdown = phases.map(phase => {
      const phaseScores = scores.filter(s => s.phaseId === phase.id)
      const totalPhasePoints = phaseScores.reduce((sum, s) => sum + s.points, 0)
      return {
        phaseName: phase.name,
        timeDuration: phase.timeDuration,
        totalPoints: totalPhasePoints
      }
    })

    return {
      sessionOverview: {
        timeDuration: gameFormat.timeDuration,
        totalPhases: phases.length,
        activePlayers: activePlayersCount
      },
      badges: capabilities?.badgeNames || [],
      sessionStats: {
        averageScore: avgScore,
        topPerformer: topPlayer
          ? { name: topPlayer.name, points: sortedPlayers[0].total }
          : null,
        completionRate: (scores.length > 0 ? 100 : 0),
        participationRate: activePlayersCount
      },
      playerRanking,
      phasesBreakdown: phaseBreakdown
    }
  }

async getUserSessionScores(userId: number, sessionId: number) {
  const [user, session] = await Promise.all([
    this.prisma.user.findUnique({ where: { id: userId } }),
    this.prisma.session.findUnique({ where: { id: sessionId } })
  ])

  if (!user) throw new NotFoundException('User not found')
  if (!session) throw new NotFoundException('Session not found')

  const [questions, answers, scores] = await Promise.all([
    this.prisma.question.findMany({
      where: { sessionId },
      select: { id: true, type: true }
    }),
    this.prisma.playerAnswer.findMany({
      where: { playerId: userId, sessionId },
      select: { questionId: true }
    }),
    this.prisma.score.findMany({
      where: { playerId: userId, sessionId },
      select: { questionId: true, points: true, suggestion: true }
    })
  ])

  const totalQuestions = questions.length
  const totalSubmitted = answers.length
  const totalScored = scores.length

  const answerQuestionIds = new Set(answers.map(a => a.questionId))
  const scoreMap = new Map(scores.map(s => [s.questionId, { score: s.points, suggestion: s.suggestion }]))

  const resultScores = questions.map(q => {
    if (answerQuestionIds.has(q.id)) {
      const scoreData = scoreMap.get(q.id)
      if (scoreData) {
        return {
          questionId: q.id,
          type: q.type,
          submitted: true,
          scored: true,
          score: scoreData.score,
          suggestion: scoreData.suggestion
        }
      } else {
        return {
          questionId: q.id,
          type: q.type,
          submitted: true,
          scored: false,
          message: 'Your answer has been received but is pending evaluation.'
        }
      }
    } else {
      return {
        questionId: q.id,
        type: q.type,
        submitted: false,
        scored: false,
        message: 'You have not submitted an answer for this question yet.'
      }
    }
  })

  return {
    session: { id: session.id, description: session.description },
    totalQuestions,
    totalSubmitted,
    totalScored,
    scores: resultScores
  }
}



}
