// src/player-answer/player-answer.module.ts
import { Module } from '@nestjs/common'
import { PlayerAnswerService } from './player-answer.service'
import { PlayerAnswerController } from './player-answer.controller'
import { PrismaService } from '../lib/prisma/prisma.service'

@Module({
  controllers: [PlayerAnswerController],
  providers: [PlayerAnswerService, PrismaService],
})
export class PlayerAnswerModule {}
