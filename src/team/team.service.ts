import { Injectable } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto'
import { JoinTeamDto } from './dto/join-team.dto'

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async createTeam(dto: CreateTeamDto) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
              description: dto.description,
        sessionId: dto.sessionId,
        gameFormatId: dto.gameFormatId,
        createdById: dto.createdById,
        code
      }
    })
    return team
  }

  async joinTeam(dto: JoinTeamDto) {
    const team = await this.prisma.team.findUnique({ where: { code: dto.code } })
    if (!team) throw new Error('Invalid code')
    await this.prisma.teamPlayer.create({
      data: {
        teamId: team.id,
        playerId: dto.playerId
      }
    })
    return { message: 'Joined team successfully' }
  }

async getTeamStatus(teamId: number) {
  const team = await this.prisma.team.findUnique({
    where: { id: teamId },
    include: {
      session: true,
      gameFormat: {
        include: {
          facilitators: true
        }
      },
      players: true
    }
  })

  if (!team) throw new Error('Team not found')
  return team
}

}
