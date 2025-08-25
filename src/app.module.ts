import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './lib/prisma/prisma.service';
import { JwtService } from './lib/jwt/jwt.service';
import { RoleModule } from './role/role.module';


@Module({
  imports: [AuthModule, RoleModule],
  providers: [PrismaService, JwtService],
})
export class AppModule {}
