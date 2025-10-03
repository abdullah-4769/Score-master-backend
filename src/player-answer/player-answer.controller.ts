// src/player-answer/player-answer.controller.ts
import { Controller, Post, Body, Get, Param, ParseIntPipe } from '@nestjs/common'
import { PlayerAnswerService } from './player-answer.service'
import { CreatePlayerAnswerDto } from './dto/create-player-answer.dto'

@Controller('player-answers')
export class PlayerAnswerController {
  constructor(private service: PlayerAnswerService) {}

  @Post('submit')
  submitAnswer(@Body() dto: CreatePlayerAnswerDto) {
    return this.service.submitAnswer(dto)
  }

  @Get('facilitator/:facilitatorId/session/:sessionId')
  getAnswersByFacilitator(
    @Param('facilitatorId', ParseIntPipe) facilitatorId: number,
    @Param('sessionId', ParseIntPipe) sessionId: number,
  ) {
    return this.service.getAnswersByFacilitator(facilitatorId, sessionId)
  }
}
