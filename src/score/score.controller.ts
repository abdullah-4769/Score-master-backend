import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common'
import { ScoreService } from './score.service'
import { CreateScoreDto } from './dto/create-score.dto'
import { UpdateScoreDto } from './dto/update-score.dto'

@Controller('scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post()
  create(@Body() dto: CreateScoreDto) {
    return this.scoreService.create(dto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scoreService.findOne(Number(id))
  }

  @Get('player/:playerId')
  findByPlayer(@Param('playerId') playerId: string) {
    return this.scoreService.findByPlayer(Number(playerId))
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScoreDto) {
    return this.scoreService.update(Number(id), dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scoreService.remove(Number(id))
  }

@Get('player/:playerId/question/:questionId')
getByQuestionAndPlayer(
  @Param('playerId') playerId: string,
  @Param('questionId') questionId: string
) {
  return this.scoreService.findByQuestionAndPlayer(
    Number(questionId),
    Number(playerId)
  )
}


// score.controller.ts

@Get('ranking/session/:sessionId')
getPlayerRanking(@Param('sessionId') sessionId: string) {
  return this.scoreService.getPlayerRanking(Number(sessionId))
}

@Get('ranking/sessions/:sessionId')
getSessionRanking(@Param('sessionId') sessionId: string) {
  return this.scoreService.getSessionRanking(Number(sessionId))
}


}
