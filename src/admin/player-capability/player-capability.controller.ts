import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common'
import { PlayerCapabilityService } from './player-capability.service'
import { CreatePlayerCapabilityDto } from './dto/create-player-capability.dto'
import { UpdatePlayerCapabilityDto } from './dto/update-player-capability.dto'

@Controller('admin/player-capability')
export class PlayerCapabilityController {
  constructor(private readonly service: PlayerCapabilityService) {}

  @Post()
  create(@Body() dto: CreatePlayerCapabilityDto) {
    return this.service.create(dto)
  }

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlayerCapabilityDto) {
    return this.service.update(+id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }

  @Get('by-format/:gameFormatId')
  findByGameFormat(@Param('gameFormatId') gameFormatId: string) {
    return this.service.findByGameFormatId(+gameFormatId)
  }
}
