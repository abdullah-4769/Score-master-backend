import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { TeamService } from './team.service'
import { CreateTeamDto } from './dto/create-team.dto'

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post('create')
  createTeam(@Body() dto: CreateTeamDto) {
    return this.teamService.createTeam(dto)
  }

  @Get('session/:sessionId/members')
  getSessionMembers(@Param('sessionId') sessionId: string) {
    return this.teamService.getSessionMembers(Number(sessionId))
  }

 @Get('session/:sessionId/phase/:phaseId')
  getPlayerPhaseStatus(
    @Param('sessionId') sessionId: string,
    @Param('phaseId') phaseId: string
  ) {
    return this.teamService.getPlayerPhaseStatus(
      Number(sessionId),
      Number(phaseId)
    )
  }

@Get('session/:sessionId/players')
getCreatedTeams(@Param('sessionId') sessionId: string) {
  return this.teamService.getCreatedTeams(Number(sessionId))
}


}
