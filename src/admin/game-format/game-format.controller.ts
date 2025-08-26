import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { GameFormatService } from './game-format.service';
import { CreateGameFormatDto } from './dto/create-game-format.dto';
import { UpdateGameFormatDto } from './dto/update-game-format.dto';

@Controller('admin/game-formats')
export class GameFormatController {
  constructor(private readonly gameFormatService: GameFormatService) {}

 @Post()
  async create(@Body() dto: CreateGameFormatDto) {
    return this.gameFormatService.create(dto);
  }

  @Get()
  findAll() {
    return this.gameFormatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameFormatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGameFormatDto) {
    return this.gameFormatService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameFormatService.remove(+id);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.gameFormatService.publish(+id);
  }
}
