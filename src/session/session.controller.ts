import { Controller, Post, Body,Get,ParseIntPipe, Param, Patch, Req ,BadRequestException} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JoinSessionDto } from './dto/join-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private sessionService: SessionService) {}

 @Post()
async create(@Body() dto: CreateSessionDto) {
  if (!dto.userId) {
    throw new BadRequestException("userId is required");
  }
  return this.sessionService.createSession(dto.userId, dto.gameFormatId, dto.duration);
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
  async getRemainingTime(
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    const remainingTime = await this.sessionService.getRemainingTime(sessionId);
    return { sessionId, remainingTime };
  }

  @Get(':id/players')
  async getPlayers(@Param('id', ParseIntPipe) sessionId: number) {
    const players = await this.sessionService.getPlayersInSession(sessionId);
    return { sessionId, players };
  }

}
