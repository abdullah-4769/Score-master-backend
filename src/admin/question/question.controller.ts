import { Controller, Post, Get, Param, Body, Patch, Delete } from '@nestjs/common'
import { QuestionService } from './question.service'
import { CreateQuestionDto} from './dto/create-question.dto'
import {  UpdateQuestionDto } from './dto/update-question.dto'
@Controller('questions')
export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  @Post()
  create(@Body() dto: CreateQuestionDto) {
    return this.service.create(dto)
  }

  @Get('phase/:phaseId')
  findAll(@Param('phaseId') phaseId: string) {
    return this.service.findAll(phaseId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
