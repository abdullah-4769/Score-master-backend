import { Module } from '@nestjs/common';
import { GameFormatService } from './game-format.service';
import { GameFormatController } from './game-format.controller';
import { PrismaService } from 'src/lib/prisma/prisma.service';

@Module({
  controllers: [GameFormatController],
  providers: [GameFormatService, PrismaService],
})
export class GameFormatModule {}
 