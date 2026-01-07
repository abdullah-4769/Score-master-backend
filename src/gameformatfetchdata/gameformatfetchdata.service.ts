// src/gameformatfetchdata/gameformatfetchdata.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'

@Injectable()
export class GameFormatFetchDataService {
  constructor(private prisma: PrismaService) {}

  async getGameFormatById(id: number) {
    const gameFormat = await this.prisma.gameFormat.findUnique({
      where: { id },
      include: {
        phases: {
          include: {
            questions: true, // fetch all questions for each phase
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!gameFormat) {
      throw new NotFoundException(`GameFormat with id ${id} not found`)
    }

    return gameFormat
  }


async getQuestionsByPhaseId(phaseId: number) {
  const phase = await this.prisma.phase.findUnique({
    where: { id: phaseId },
    include: {
      questions: true,
    },
  })

  if (!phase) {
    throw new NotFoundException(`Phase with id ${phaseId} not found`)
  }

  // If no questions, return phase with a message
  if (!phase.questions || phase.questions.length === 0) {
    return {
      ...phase,
      questions: [],
      message: 'No questions exist for this phase yet',
    }
  }

  return phase
}




async getFormatWithPhasesSummary(formatId: number) {
  const gameFormat = await this.prisma.gameFormat.findUnique({
    where: { id: formatId },
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
  })

  if (!gameFormat) {
    throw new NotFoundException(`GameFormat with id ${formatId} not found`)
  }

  return {
    id: gameFormat.id,
    name: gameFormat.name,
    description: gameFormat.description,
    totalPhases: gameFormat.phases.length,
    phases: gameFormat.phases,
  }
}




}
