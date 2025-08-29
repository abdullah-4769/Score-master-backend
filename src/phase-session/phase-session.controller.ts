import { Controller, Post, Patch, Param, Body } from '@nestjs/common';
import { PhaseSessionService } from './phase-session.service';
import { CreatePhaseSessionDto } from './dto/create-phase-session.dto';

@Controller('phase-session')
export class PhaseSessionController {
  constructor(private readonly service: PhaseSessionService) {}

  @Post()
  async create(@Body() dto: CreatePhaseSessionDto) {
    return this.service.create(dto);
  }

@Patch(':id/start')
async start(@Param('id') id: string) {
  return this.service.start(Number(id));
}


  @Patch(':id/pause')
  async pause(@Param('id') id: string) {
    return this.service.pause(+id);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    return this.service.complete(+id);
  }

  @Patch(':id/check-current-status')
  async checkAutoPause(@Param('id') id: string) {
    return this.service.checkAutoPause(+id);
  }

  @Post(':id/remaining-time')
  async getRemainingTime(@Param('id') id: string) {
    return { remainingTime: await this.service.getRemainingTime(+id) };
  }
}
