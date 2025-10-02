import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { TeamService } from './team.service'
import { CreateTeamDto } from './dto/create-team.dto'
import { JoinTeamDto } from './dto/join-team.dto'

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post('create')
  createTeam(@Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(dto)
  }

  @Post('join')
  joinTeam(@Body() dto: JoinTeamDto) {
    return this.teamService.joinTeam(dto)
  }

  @Get(':id/status')
  getTeamStatus(@Param('id') id: string) {
    return this.teamService.getTeamStatus(Number(id))
  }
}
