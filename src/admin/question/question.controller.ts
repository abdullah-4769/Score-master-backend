import { Controller, Post, Get,ParseIntPipe, Param, Body, Patch, Delete } from '@nestjs/common'
import { QuestionService } from './question.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { GenerateQuestionDto } from './dto/generate-question.dto'
@Controller('questions')
export class QuestionController {
  constructor(private readonly service: QuestionService) {}

  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    return this.service.create(dto)
  }

  @Get('phase/:phaseId')
  async findAll(@Param('phaseId') phaseId: number) {
    return this.service.findAll(phaseId)
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateQuestionDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.service.remove(id)
  }

  

  @Post("/generate")
  async generate(@Body() dto: GenerateQuestionDto) {
    return this.service.generate(dto)
  }


  @Get('game/team/:gameId')
  async getTeamPhaseWithQuestions(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.service.findTeamPhaseWithQuestions(gameId)
  }
  @Get('questions-for-session/:gameFormatId/:sessionId')
  async getQuestions(
    @Param('gameFormatId', ParseIntPipe) gameFormatId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.service.getQuestionsForSession(gameFormatId, sessionId)
  }


@Get('session/:id/game-format')
async getGameFormatBySessionId(@Param('id', ParseIntPipe) sessionId: number) {
  return this.service.getGameFormatBySession(sessionId)
}



}
