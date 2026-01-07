import { Controller, Post, Patch, Param, Body, Get } from '@nestjs/common';
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

  @Patch(':id/toggle')
  async toggle(@Param('id') id: string) {
    return this.service.toggle(Number(id));
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.service.getStatus(Number(id));
  }
}
