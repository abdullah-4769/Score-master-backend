// src/player-answer/player-answer.service.ts
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
        answer: dto.answer,
        facilitatorId: dto.facilitatorId,
      },
      create: {
        ...dto,
      },
    })
  }

  async getAnswersByFacilitator(facilitatorId: number, sessionId: number) {
    return this.prisma.playerAnswer.findMany({
      where: {
        facilitatorId,
        sessionId,
      },
      include: {
        player: true,
        question: true,
        phase: true,
        session: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }
}
