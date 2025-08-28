import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './lib/prisma/prisma.service';
import { JwtService } from './lib/jwt/jwt.service';
import { RoleModule } from './role/role.module';
import { GameFormatModule } from './admin/game-format/game-format.module';
import { QuestionModule } from './admin/question/question.module';
import { PhaseModule } from './admin/phase/phase.module';
import { PlayerCapabilityModule } from './admin/player-capability/player-capability.module'
import { SessionModule } from './session/session.module';



@Module({
  imports: [AuthModule,
     RoleModule,
     GameFormatModule,
     PhaseModule,
     QuestionModule,
    PlayerCapabilityModule,
    SessionModule
    ],
  providers: [PrismaService, JwtService],
})
export class AppModule {}
