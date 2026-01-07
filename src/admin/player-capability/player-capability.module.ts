import { Module } from '@nestjs/common'
import { PlayerCapabilityService } from './player-capability.service'
import { PlayerCapabilityController } from './player-capability.controller'
import { PrismaService } from '../../lib/prisma/prisma.service'

@Module({
  controllers: [PlayerCapabilityController],
  providers: [PlayerCapabilityService, PrismaService],
})
export class PlayerCapabilityModule {}
