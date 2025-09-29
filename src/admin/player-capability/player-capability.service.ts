import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma/prisma.service'
import { CreatePlayerCapabilityDto } from './dto/create-player-capability.dto'
import { UpdatePlayerCapabilityDto } from './dto/update-player-capability.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class PlayerCapabilityService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePlayerCapabilityDto) {
    return this.prisma.playerCapability.create({
      data: {
        gameFormatId: dto.gameFormatId,
        minPlayers: dto.minPlayers,
        maxPlayers: dto.maxPlayers,
        badgeNames: dto.badgeNames as Prisma.JsonArray,
        requireAllTrue: dto.requireAllTrue ?? false,
        aiScoring: dto.aiScoring ?? false,
        allowLaterJoin: dto.allowLaterJoin ?? true,
        sendInvitation: dto.sendInvitation ?? false,
        recordSession: dto.recordSession ?? false,
      },
    })
  }

  async findAll() {
    return this.prisma.playerCapability.findMany()
  }

  async findOne(id: number) {
    return this.prisma.playerCapability.findUnique({ where: { id } })
  }

  async update(id: number, dto: UpdatePlayerCapabilityDto) {
    return this.prisma.playerCapability.update({ where: { id }, data: dto })
  }

  async remove(id: number) {
    return this.prisma.playerCapability.delete({ where: { id } })
  }

  async findByGameFormatId(gameFormatId: number) {
    return this.prisma.playerCapability.findMany({ where: { gameFormatId } })
  }
}
