import { Controller, Post, Body, Get, Param, Patch, ParseIntPipe,Query, BadRequestException } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

@Post()
async create(@Body() dto: CreateSessionDto) {
  return this.sessionService.createSession(dto);
}


  @Patch(':id/start')
  async start(@Param('id') id: string) {
    return this.sessionService.startSession(Number(id));
  }

  @Patch(':id/pause')
  async pause(@Param('id') id: string) {
    return this.sessionService.pauseSession(Number(id));
  }

  @Patch(':id/resume')
  async resume(@Param('id') id: string) {
    return this.sessionService.resumeSession(Number(id));
  }

  @Patch(':id/check-auto')
  async checkAuto(@Param('id') id: string) {
    return this.sessionService.checkAutoComplete(Number(id));
  }

  @Post('join')
  async join(@Body() dto: JoinSessionDto) {
    return this.sessionService.joinSession(dto.playerId, dto.joinCode);
  }

  @Get(':id/remaining-time')
  async getRemainingTime(@Param('id', ParseIntPipe) sessionId: number) {
    const remainingTime = await this.sessionService.getRemainingTime(sessionId);
    return { sessionId, remainingTime };
  }

  @Get(':id/players')
  async getPlayers(@Param('id', ParseIntPipe) sessionId: number) {
    const players = await this.sessionService.getPlayersInSession(sessionId);
    return { sessionId, players };
  }

  @Get(':id/phases')
  async getSessionPhases(@Param('id', ParseIntPipe) sessionId: number) {
    return this.sessionService.getSessionWithPhasesAndQuestions(sessionId);
  }

  @Post(':sessionId/add-player')
  async addPlayer(@Param('sessionId') sessionId: number, @Body('userId') userId: number) {
    return this.sessionService.addPlayerToSession(userId, +sessionId);
  }

  @Get(':id/progress')
  async progress(@Param('id', ParseIntPipe) id: number) {
    return this.sessionService.getSessionProgress(id);
  }

  @Post(':id/auto-join')
  async autoJoin(@Param('id', ParseIntPipe) sessionId: number, @Body('playerId') playerId: number) {
    return this.sessionService.autoJoinSession(playerId, sessionId);
  }

  @Get(':id/detail')
  async getSessionDetail(@Param('id', ParseIntPipe) sessionId: number) {
    return this.sessionService.getSessionDetail(sessionId)
  }


    @Get('all')
  getAllSessions() {
    return this.sessionService.getAllSessions()
  }



    @Get('facilitator')
  async getFacilitatorSessions(@Query('facilitatorId') facilitatorId: string) {
    const id = parseInt(facilitatorId, 10)
    return this.sessionService.getSessionsForFacilitator(id)
  }


  @Get('with-code')
  async getAllSessionsWithCode() {
    return this.sessionService.getAllSessionsWithCode()
  }


  @Patch(':id/complete')
async complete(@Param('id', ParseIntPipe) sessionId: number) {
  return this.sessionService.completeSession(sessionId);
}

}
