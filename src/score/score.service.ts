import { Injectable } from '@nestjs/common'
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





}
