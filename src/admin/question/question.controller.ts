import { Controller, Post, Get,ParseIntPipe,BadRequestException, Param, Body, Patch, Delete } from '@nestjs/common'
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
async findAll(@Param('phaseId', ParseIntPipe) phaseId: number) {
  return this.service.findAll(phaseId)
}


  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id)
  }

@Patch(':id')
async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuestionDto) {
  return this.service.update(id, dto)
}


@Delete(':id')
async remove(@Param('id') id: string) {
  const questionId = Number(id)
  if (isNaN(questionId)) {
    throw new BadRequestException('Invalid question id')
  }
  return this.service.remove(questionId)
}


  

  @Post("/generate")
  async generate(@Body() dto: GenerateQuestionDto) {
    return this.service.generate(dto)
  }


  @Get('game/team/:gameId')
  async getTeamPhaseWithQuestions(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.service.findTeamPhaseWithQuestions(gameId)
  }
@Get('questions-for-session/:sessionId/phase/:phaseId')
async getQuestions(
  @Param('sessionId', ParseIntPipe) sessionId: number,
  @Param('phaseId', ParseIntPipe) phaseId: number
) {
  return this.service.getQuestionsForPhase(sessionId, phaseId)
}



@Get('session/:id/game-format')
async getGameFormatBySessionId(@Param('id', ParseIntPipe) sessionId: number) {
  return this.service.getGameFormatBySession(sessionId)
}

@Get('session/:sessionId')
async getQuestionsBySession(@Param('sessionId') sessionId: number) {
  return this.service.getQuestionsBySession(+sessionId)
}

@Get('questions-for-session/:gameFormatId/:sessionId')
async getQuestionsForSession(
  @Param('gameFormatId', ParseIntPipe) gameFormatId: number,
  @Param('sessionId', ParseIntPipe) sessionId: number
) {
  return this.service.getQuestionsForSessionModel(gameFormatId, sessionId)
}


}
