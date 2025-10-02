import { Module } from '@nestjs/common'
import { SessionService } from './session.service'
import { SessionController } from './session.controller'
import { PrismaService } from '../lib/prisma/prisma.service'
import { JwtService } from '../lib/jwt/jwt.service'
import { WebsocketModule } from '../websocket/websocket.module'
// import { MiddlewareConsumer, NestModule } from '@nestjs/common'
// import { FacilitatorMiddleware } from '../middleware/facilitator.middleware'

@Module({
  controllers: [SessionController],
  providers: [SessionService, PrismaService, JwtService],
  exports: [SessionService],
  imports: [WebsocketModule],
})
// Note: Middleware setup is present but not active
// export class SessionModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(FacilitatorMiddleware)
//       .forRoutes('sessions/join')
//   }
// }
export class SessionModule {}
