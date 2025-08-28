// phase.controller.ts
import { Body, Controller, Delete, Get, ParseIntPipe, Param, Post, Put } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Controller('admin/phases')
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @Post()
  create(@Body() dto: CreatePhaseDto) {
    return this.phaseService.create(dto);
  }

  @Get()
  findAll() {
    return this.phaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phaseService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePhaseDto) {
    return this.phaseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phaseService.remove(id);
  }

  @Delete('game-format/:formatId')
  removeByFormat(@Param('formatId', ParseIntPipe) formatId: number) {
    return this.phaseService.removeByFormat(formatId);
  }
}
