import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma/prisma.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreateQuestionDto) {
  const data: any = {
    phase: { connect: { id: dto.phaseId } },
    type: dto.type,
  }

  if (dto.questionText !== undefined) data.questionText = dto.questionText
  if (dto.scoringRubric !== undefined) data.scoringRubric = dto.scoringRubric
  if (dto.order !== undefined) data.order = dto.order
  if (dto.point !== undefined) data.point = dto.point
  if (dto.mcqOptions !== undefined) data.mcqOptions = dto.mcqOptions

  return this.prisma.question.create({ data })
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
  const data: any = {}

  if (dto.type !== undefined) data.type = dto.type
  if (dto.questionText !== undefined) data.questionText = dto.questionText
  if (dto.scoringRubric !== undefined) data.scoringRubric = dto.scoringRubric
  if (dto.order !== undefined) data.order = dto.order
  if (dto.point !== undefined) data.point = dto.point
  if (dto.mcqOptions !== undefined) data.mcqOptions = dto.mcqOptions

  return this.prisma.question.update({
    where: { id },
    data
  })
}

  async remove(id: string) {
    return this.prisma.question.delete({ where: { id } })
  }
}
