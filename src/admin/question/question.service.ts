import { Injectable ,NotFoundException,BadRequestException} from '@nestjs/common'
import { PrismaService } from '../../lib/prisma/prisma.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { llm } from '../../lib/llm/llm'
import { questionprompt } from '../../lib/prompt/createqustion'
import { HumanMessage } from "@langchain/core/messages";

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreateQuestionDto) {
  const data: any = {
    session: { connect: { id: dto.sessionId } },
    phase: { connect: { id: dto.phaseId } },
    type: dto.type
  }

  if (dto.scenario !== undefined) data.scenario = dto.scenario
  if (dto.questionText !== undefined) data.questionText = dto.questionText
  if (dto.scoringRubric !== undefined) data.scoringRubric = dto.scoringRubric
  if (dto.order !== undefined) data.order = dto.order
  if (dto.point !== undefined) data.point = dto.point
  if (dto.mcqOptions !== undefined) data.mcqOptions = dto.mcqOptions
  if (dto.sequenceOptions !== undefined) data.sequenceOptions = dto.sequenceOptions
  if (dto.correctSequence !== undefined) data.correctSequence = dto.correctSequence

  return this.prisma.question.create({ data })
}


  async findAll(phaseId: number) {
    return this.prisma.question.findMany({
      where: { phaseId },
      orderBy: { order: 'asc' }
    })
  }

  async findOne(id: number) {
    return this.prisma.question.findUnique({ where: { id } })
  }

  async update(id: number, dto: UpdateQuestionDto) {
    const data: any = {}

    if (dto.type !== undefined) data.type = dto.type
    if (dto.scenario !== undefined) data.scenario = dto.scenario
    if (dto.questionText !== undefined) data.questionText = dto.questionText
    if (dto.scoringRubric !== undefined) data.scoringRubric = dto.scoringRubric
    if (dto.order !== undefined) data.order = dto.order
    if (dto.point !== undefined) data.point = dto.point
    if (dto.mcqOptions !== undefined) data.mcqOptions = dto.mcqOptions
    if (dto.sequenceOptions !== undefined) data.sequenceOptions = dto.sequenceOptions
    if (dto.correctSequence !== undefined) data.correctSequence = dto.correctSequence

    return this.prisma.question.update({ where: { id }, data })
  }

  async remove(id: number) {
    return this.prisma.question.delete({ where: { id } })
  }



async generate(dto: {
  topic?: number
  type: 'MCQ' | 'OPEN_ENDED' | 'PUZZLE' | 'SIMULATION'
  gameName: string
  phaseName: string
    language?: string
}) {
  const prompt = questionprompt(dto.type, dto.gameName, dto.phaseName, dto.topic, dto.language)

  const response = await llm.call([new HumanMessage(prompt)])

  // Remove Markdown code fences if present
  const cleanedText = response.text
    .trim()
    .replace(/^```json\s*/, '')  // remove starting ```json
    .replace(/```$/, '')          // remove ending ```
  
  try {
    const question = JSON.parse(cleanedText)
    return question
  } catch (e) {
    return { error: 'Failed to parse AI response', raw: cleanedText }
  }
}


  async findTeamPhaseWithQuestions(gameId: number) {
    const gameFormat = await this.prisma.gameFormat.findUnique({
      where: { id: gameId },
      include: {
        facilitators: true,
        phases: {
          orderBy: { order: 'asc' },
          include: { questions: { orderBy: { order: 'asc' } } },
        },
      },
    })
    if (!gameFormat) throw new NotFoundException('Game not found')

    return {
      id: gameFormat.id,
      name: gameFormat.name,
      description: gameFormat.description,
      mode: gameFormat.mode,
      totalPhases: gameFormat.totalPhases,
      timeDuration: gameFormat.timeDuration,
      isPublished: gameFormat.isPublished,
      isActive: gameFormat.isActive,
      facilitators: gameFormat.facilitators.map(f => ({
        id: f.id,
        name: f.name,
        email: f.email,
      })),
      phases: gameFormat.phases.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        order: p.order,
        scoringType: p.scoringType,
        timeDuration: p.timeDuration,
        challengeTypes: p.challengeTypes,
        difficulty: p.difficulty,
        badge: p.badge,
        requiredScore: p.requiredScore,
        questions: p.questions.map(q => ({
          id: q.id,
          type: q.type,
          scenario: q.scenario,
          questionText: q.questionText,
          scoringRubric: q.scoringRubric,
          order: q.order,
          point: q.point,
          mcqOptions: q.mcqOptions,
          sequenceOptions: q.sequenceOptions,
          correctSequence: q.correctSequence,
        })),
      })),
    }
  }



  
async getQuestionsForPhase(sessionId: number, phaseId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
  })

  if (!session) throw new NotFoundException('Session not found')
  if (session.status !== 'ACTIVE') throw new BadRequestException('Session is not active')

  const questions = await this.prisma.question.findMany({
    where: {
      sessionId,
      phaseId
    },
    orderBy: { order: 'asc' }
  })

  if (questions.length === 0) {
    throw new NotFoundException('No questions found for this phase in this session')
  }

  return {
    sessionId: session.id,
    phaseId,
    questions
  }
}


















async getGameFormatBySession(sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      gameFormat: {
        include: {
          phases: {
            include: {
              questions: false,
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!session) throw new NotFoundException('Session not found')

  return {
    sessionId: session.id,
    gameFormat: session.gameFormat,
  }
}

async getQuestionsBySession(sessionId: number) {
  const phases = await this.prisma.phase.findMany({
    where: {
      gameFormat: {
        sessions: {
          some: {
            id: sessionId
          }
        }
      }
    },
    include: {
      questions: {
        where: { sessionId },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  })

  return phases.map(phase => ({
    id: phase.id,
    name: phase.name,
    description: phase.description,
    questions: phase.questions.map(q => ({
      id: q.id,
      type: q.type,
      scenario: q.scenario,
      questionText: q.questionText,
      point: q.point,
      order: q.order,
      mcqOptions: q.mcqOptions,
      sequenceOptions: q.sequenceOptions,
      correctSequence: q.correctSequence
    }))
  }))
}
async getQuestionsForSessionModel(sessionId: number, phaseId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      gameFormat: {
        include: {
          phases: {
            where: { id: phaseId },
            orderBy: { order: 'asc' },
            include: {
              questions: {
                where: { sessionId },
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      }
    }
  })

  if (!session) throw new NotFoundException('Session not found')

  return {
    sessionId: session.id,
    gameFormatId: session.gameFormat.id,
    phases: session.gameFormat.phases.map(phase => ({
      id: phase.id,
      gameFormatId: phase.gameFormatId,
      name: phase.name,
      description: phase.description ?? '',
      order: phase.order ?? 0,
      scoringType: phase.scoringType,
      timeDuration: phase.timeDuration,
      challengeTypes: phase.challengeTypes,
      difficulty: phase.difficulty,
      badge: phase.badge ?? '',
      requiredScore: phase.requiredScore ?? 0,
      createdAt: phase.createdAt,
      updatedAt: phase.updatedAt,
      questions: phase.questions.map(q => {
        const rubric = q.scoringRubric as any

        let correct = 0

        if (rubric && typeof rubric === 'object') {
          const values = Object.values(rubric).filter(v => typeof v === 'number')
          if (values.length > 0) {
            correct = Math.max(...values)
          }
        }

        return {
          id: q.id,
          phaseId: q.phaseId,
          type: q.type,
          scenario: q.scenario ?? '',
          questionText: q.questionText ?? '',
          scoringRubric: {
            wrong: 0,
            correct: correct
          },
          order: q.order ?? 0,
          point: q.point ?? correct,
          mcqOptions: q.mcqOptions,
          sequenceOptions: q.sequenceOptions,
          correctSequence: q.correctSequence,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt
        }
      })
    }))
  }
}



}
