import { Module } from '@nestjs/common';
import { PhaseService } from './phase.service';
import { PhaseController } from './phase.controller';
import { PrismaService } from '../../lib/prisma/prisma.service';

@Module({
  controllers: [PhaseController],
  providers: [PhaseService, PrismaService],
})
export class PhaseModule {}
