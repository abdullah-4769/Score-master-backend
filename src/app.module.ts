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
import { GameFormatFetchDataModule } from './gameformatfetchdata/gameformatfetchdata.module'
import { PhaseSessionModule } from './phase-session/phase-session.module';
import { WebsocketModule } from './websocket/websocket.module';
import { TeamModule } from './team/team.module';
import { PlayerAnswerModule } from './player-answer/player-answer.module';
import { EvaluationModule } from "./evaluation/evaluation.module";
import { ScoreModule } from './score/score.module';
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { AppController } from './app.controller'
import { AgoraModule } from './agora/agora.module'

@Module({
  imports: [
    AgoraModule,
    AuthModule,
    RoleModule,
    GameFormatModule,
    PhaseModule,
    QuestionModule,
    PlayerCapabilityModule,
    SessionModule,
    GameFormatFetchDataModule,
    PhaseSessionModule,
    WebsocketModule,
    TeamModule,
    PlayerAnswerModule,
        ScoreModule,
    EvaluationModule,
    UserModule,

  ],

    controllers: [AppController],

  providers: [PrismaService, JwtService, AppService],
})
export class AppModule { }
