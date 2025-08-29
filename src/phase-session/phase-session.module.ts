import { Module } from '@nestjs/common';
import { PhaseSessionService } from './phase-session.service';
import { PhaseSessionController } from './phase-session.controller';
import { PrismaService } from '../lib/prisma/prisma.service';

@Module({
  controllers: [PhaseSessionController],
  providers: [PhaseSessionService, PrismaService],
})
export class PhaseSessionModule {}
