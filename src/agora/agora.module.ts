import { Module } from '@nestjs/common'
import { AgoraService } from './agora.service'
import { AgoraController } from './agora.controller'
import { PrismaService } from '../lib/prisma/prisma.service'
@Module({
  providers: [AgoraService,PrismaService],
  controllers: [AgoraController],
  exports: [AgoraService],
})
export class AgoraModule {}
