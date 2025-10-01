import { Controller, Get, Post, Body, Param,ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { GameFormatService } from './game-format.service';
import { CreateGameFormatDto } from './dto/create-game-format.dto';
import { UpdateGameFormatDto } from './dto/update-game-format.dto';

@Controller('admin/game-formats')
export class GameFormatController {
  constructor(private readonly gameFormatService: GameFormatService) {}

  @Post()
  async create(@Body() dto: CreateGameFormatDto) {
    return await this.gameFormatService.create(dto);
  }
  @Get('all-games')
  getAllGamesPhases() {
    return this.gameFormatService.getGamesSummary();
  }

  @Get()
  async findAll() {
    return await this.gameFormatService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.gameFormatService.findOne(Number(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGameFormatDto) {
    return await this.gameFormatService.update(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.gameFormatService.remove(Number(id));
  }

  @Patch(':id/publish')
  async publish(@Param('id') id: string) {
    return await this.gameFormatService.publish(Number(id));
  }

@Get('facilitator/:id')
async getByFacilitator(@Param('id') facilitatorId: string) {
  const formats = await this.gameFormatService.findByFacilitatorId(+facilitatorId)
  return formats
}


  @Get(':id/facilitators')
  async getFacilitators(@Param('id', ParseIntPipe) id: number) {
    return this.gameFormatService.findFacilitatorsByGameId(id);
  }


}
