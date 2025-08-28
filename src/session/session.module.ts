import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PrismaService } from '../lib/prisma/prisma.service';
import { JwtService } from '../lib/jwt/jwt.service';
import { FacilitatorMiddleware } from '../middleware/facilitator.middleware';

@Module({
  controllers: [SessionController],
  providers: [SessionService, PrismaService, JwtService],
})
export class SessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FacilitatorMiddleware)
      .forRoutes('sessions/join'); 
  }
}
