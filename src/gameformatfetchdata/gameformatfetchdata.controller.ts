// src/gameformatfetchdata/gameformatfetchdata.controller.ts
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { GameFormatFetchDataService } from './gameformatfetchdata.service'

@Controller('gameformat')
export class GameFormatFetchDataController {
  constructor(private readonly gameFormatService: GameFormatFetchDataService) {}

  @Get(':id')
  async getGameFormat(@Param('id', ParseIntPipe) id: number) {
    return this.gameFormatService.getGameFormatById(id)
  }

  @Get('phase/:phaseId/questions')
  async getQuestionsByPhaseId(@Param('phaseId') phaseId: number) {
    return this.gameFormatService.getQuestionsByPhaseId(phaseId)
  }


 @Get(':id/summary')
  async getFormatSummary(@Param('id', ParseIntPipe) id: number) {
    return this.gameFormatService.getFormatWithPhasesSummary(id)
  }


}
