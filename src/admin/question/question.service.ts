import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma/prisma.service'
import { CreateQuestionDto} from './dto/create-question.dto'
import {  UpdateQuestionDto } from './dto/update-question.dto'

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateQuestionDto) {
    return this.prisma.question.create({
      data: {
        phase: { connect: { id: dto.phaseId } },
        type: dto.type,
        questionText: dto.questionText,
        scoringRubric: dto.scoringRubric,
        order: dto.order
      }
    })
  }

  async findAll(phaseId: string) {
    return this.prisma.question.findMany({
      where: { phaseId },
      orderBy: { order: 'asc' }
    })
  }

  async findOne(id: string) {
    return this.prisma.question.findUnique({ where: { id } })
  }

  async update(id: string, dto: UpdateQuestionDto) {
    return this.prisma.question.update({
      where: { id },
      data: dto
    })
  }

  async remove(id: string) {
    return this.prisma.question.delete({ where: { id } })
  }
}
