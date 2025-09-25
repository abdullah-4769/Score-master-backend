import { Controller, Post, Get, Param, Body, Patch, Delete } from '@nestjs/common'
import { QuestionService } from './question.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'

@Controller('questions')
export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  // Create placeholder or full question
  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    return await this.service.create(dto)
  }

  // Get all questions for a specific phase
  @Get('phase/:phaseId')
  async findAll(@Param('phaseId') phaseId: number) {
    return await this.service.findAll(phaseId)
  }

  // Get a single question by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id)
  }

  // Update an existing question
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return await this.service.update(id, dto)
  }

  // Delete a question
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.service.remove(id)
  }
}
