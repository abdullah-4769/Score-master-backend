import { Injectable } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'
import { CreatePlayerAnswerDto } from './dto/create-player-answer.dto'

@Injectable()
export class PlayerAnswerService {
  constructor(private prisma: PrismaService) {}

  async submitAnswer(dto: CreatePlayerAnswerDto) {
    return this.prisma.playerAnswer.upsert({
      where: {
        playerId_questionId_sessionId: {
          playerId: dto.playerId,
          questionId: dto.questionId,
          sessionId: dto.sessionId,
        },
      },
      update: {
        answerData: dto.answerData,
        facilitatorId: dto.facilitatorId,
      },
      create: {
        playerId: dto.playerId,
        facilitatorId: dto.facilitatorId,
        sessionId: dto.sessionId,
        phaseId: dto.phaseId,
        questionId: dto.questionId,
        answerData: dto.answerData,
      },
    })
  }

async getAnswersByFacilitatorAndPhase(facilitatorId: number, phaseId: number) {
  // fetch all questions in this phase
  const questions = await this.prisma.question.findMany({
    where: { phaseId },
    orderBy: { order: 'asc' },
  })

  // fetch all answers for this facilitator in this phase
  const answers = await this.prisma.playerAnswer.findMany({
    where: {
      facilitatorId,
      phaseId,
    },
    include: {
      player: true,
      question: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // group answers under their questions
  const result = questions.map(q => {
    const questionAnswers = answers.filter(a => a.questionId === q.id)
    return {
      question: {
        id: q.id,
        text: q.questionText,
        scenario: q.scenario,
        type: q.type,
        point: q.point,
      },
      answers: questionAnswers.map(a => ({
        player: {
          id: a.player.id,
          name: a.player.name,
        },
        answerData: a.answerData,
        submittedAt: a.createdAt,
      })),
    }
  })

  return result
}

async deleteAllAnswers() {
  return this.prisma.playerAnswer.deleteMany({})
}


}
