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

async getAnswersBySessionAndPhase(sessionId: number, phaseId: number, page: number = 1) {
  const PAGE_SIZE = 10


  const [phase, answersWithRelations, totalAnswers] = await Promise.all([
    this.prisma.phase.findUnique({ 
      where: { id: phaseId },
      select: {
        id: true,
        name: true,
        description: true,
        scoringType: true,
        timeDuration: true,
        challengeTypes: true,
        difficulty: true,
        badge: true,
        requiredScore: true,
      }
    }),
    
    this.prisma.playerAnswer.findMany({
      where: { sessionId, phaseId },
      select: {
        answerData: true,
        createdAt: true,
        player: {
          select: { id: true, name: true }
        },
        question: {
          select: { 
            id: true, 
            questionText: true, 
            scenario: true, 
            type: true, 
            point: true,
            order: true 
          }
        }
      },
      orderBy: [
        { question: { order: 'asc' } },
        { createdAt: 'asc' }
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    
    this.prisma.playerAnswer.count({ 
      where: { sessionId, phaseId } 
    }),
  ])

  if (!phase) throw new Error('Phase not found')
  const questionsMap = new Map()
  
  for (const answer of answersWithRelations) {
    const qId = answer.question.id
    
    if (!questionsMap.has(qId)) {
      questionsMap.set(qId, {
        question: answer.question,
        answers: []
      })
    }
    
    questionsMap.get(qId).answers.push({
      player: answer.player,
      answerData: answer.answerData,
      submittedAt: answer.createdAt,
    })
  }

  return {
    phase,
    questions: Array.from(questionsMap.values()),
    pagination: {
      currentPage: page,
      pageSize: PAGE_SIZE,
      totalItems: totalAnswers,
      totalPages: Math.ceil(totalAnswers / PAGE_SIZE),
      hasNext: page * PAGE_SIZE < totalAnswers,
      hasPrev: page > 1
    }
  }
}





}
