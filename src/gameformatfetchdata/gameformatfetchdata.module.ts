// src/gameformatfetchdata/gameformatfetchdata.module.ts
import { Module } from '@nestjs/common'
import { GameFormatFetchDataService } from './gameformatfetchdata.service'
import { GameFormatFetchDataController } from './gameformatfetchdata.controller'
import { PrismaService } from '../lib/prisma/prisma.service'

@Module({
  controllers: [GameFormatFetchDataController],
  providers: [GameFormatFetchDataService, PrismaService],
})
export class GameFormatFetchDataModule {}
