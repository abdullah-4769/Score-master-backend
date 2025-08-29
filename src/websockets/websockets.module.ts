import { Module } from '@nestjs/common';
import { SessionGateway } from './gateway/session.gateway';

@Module({
  providers: [SessionGateway],
  exports: [SessionGateway],
})
export class WebsocketsModule {}
