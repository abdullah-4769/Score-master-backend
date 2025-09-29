import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
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


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.phaseService.remove(id);
  }

  @Delete('game-format/:formatId')
  removeByFormat(@Param('formatId', ParseIntPipe) formatId: number) {
    return this.phaseService.removeByFormat(formatId);
  }

  @Get('game/:gameFormatId')
  async getByGameFormat(@Param('gameFormatId', ParseIntPipe) gameFormatId: number) {
    return this.phaseService.findByGameFormat(gameFormatId);
  }


    @Get(':id')
  getPhaseById(@Param('id', ParseIntPipe) id: number) {
    return this.phaseService.findOne(id)
  }


   @Put(':id')
  updatePhase(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePhaseDto) {
    return this.phaseService.update(id, dto)
  }


  @Get('game/all/:gameId')
  getAllPhasesOfGame(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.phaseService.findAllByGame(gameId)
  }

}
