// src/player-answer/player-answer.controller.ts
import { Controller, Post, Body,Query, Get,Delete, Param, ParseIntPipe } from '@nestjs/common'
import { PlayerAnswerService } from './player-answer.service'
import { CreatePlayerAnswerDto } from './dto/create-player-answer.dto'

@Controller('player-answers')
export class PlayerAnswerController {
  constructor(private service: PlayerAnswerService) {}

  @Post('submit')
  submitAnswer(@Body() dto: CreatePlayerAnswerDto) {
    return this.service.submitAnswer(dto)
  }

@Get('facilitator/:facilitatorId/phase/:phaseId')
getAnswersByFacilitatorAndPhase(
  @Param('facilitatorId', ParseIntPipe) facilitatorId: number,
  @Param('phaseId', ParseIntPipe) phaseId: number,
) {
  return this.service.getAnswersByFacilitatorAndPhase(facilitatorId, phaseId)
}


@Delete('delete-all')
deleteAllAnswers() {
  return this.service.deleteAllAnswers()
}

@Get('session/:sessionId/phase/:phaseId')
getAnswersBySessionAndPhase(
  @Param('sessionId', ParseIntPipe) sessionId: number,
  @Param('phaseId', ParseIntPipe) phaseId: number,
  @Query('page', ParseIntPipe) page = 1,
) {
  return this.service.getAnswersBySessionAndPhase(sessionId, phaseId, page)
}


}
