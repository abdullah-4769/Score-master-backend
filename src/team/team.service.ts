import { Injectable } from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'
import { CreateTeamDto } from './dto/create-team.dto'

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async createTeam(dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: {
        nickname: dto.nickname,
        sessionId: dto.sessionId,
        gameFormatId: dto.gameFormatId,
        createdById: dto.createdById
      }
    })
    return team
  }

async getSessionMembers(sessionId: number) {
  const session = await this.prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      teams: {
        include: {
          players: {
            include: { player: true }
          }
        }
      },
      gameFormat: {
        include: {
          facilitators: true
        }
      }
    }
  })

  if (!session) throw new Error('Session not found')

  return {
    sessionId: session.id,
    sessionJoinCode: session.joinCode, // <-- use joinCode here
    gameFormat: {
      id: session.gameFormat.id,
      name: session.gameFormat.name,
      facilitators: session.gameFormat.facilitators
    },
    teams: session.teams
  }
}

 async getPlayerPhaseStatus(sessionId: number, phaseId: number) {
    // fetch all players in the session
    const teams = await this.prisma.team.findMany({
      where: { sessionId },
      include: { players: { include: { player: true } } }
    })

    const allPlayers = teams.flatMap(team => team.players.map(tp => tp.player))

    // fetch all questions in the phase
    const questions = await this.prisma.question.findMany({
      where: { phaseId }
    })
    const questionIds = questions.map(q => q.id)

    // fetch all answers for these questions in this session
    const answers = await this.prisma.playerAnswer.findMany({
      where: {
        sessionId,
        questionId: { in: questionIds }
      }
    })

    // map player status by phase
    const result = allPlayers.map(player => {
      const hasAnswer = answers.some(a => a.playerId === player.id)
      return {
        playerId: player.id,
        name: player.name,
        email: player.email,
        status: hasAnswer ? 'complete' : 'pending'
      }
    })

    return result
  }
async getCreatedTeams(sessionId: number) {
  
  const teams = await this.prisma.team.findMany({
    where: { sessionId },
    include: {
      createdBy: true, 
      players: { 
        include: { player: true } 
      }
    }
  })


  return teams.map(team => ({
    teamId: team.id,
    nickname: team.nickname,
    createdAt: team.createdAt,
    createdBy: {
      id: team.createdBy.id,
      name: team.createdBy.name,
      email: team.createdBy.email
    },
    players: team.players.map(tp => ({
      id: tp.player.id,
      name: tp.player.name,
      email: tp.player.email,
      joinedAt: tp.joinedAt
    }))
  }))
}




}
