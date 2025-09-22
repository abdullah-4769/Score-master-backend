import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { JwtService } from '../lib/jwt/jwt.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}


async register(dto: RegisterDto) {
  const hashedPassword = await bcrypt.hash(dto.password, 10)

  // Determine role
  let roleTitle = dto.role || 'User'
  if (dto.roleId) {
    const role = await this.prisma.role.findFirst({
      where: { id: dto.roleId },
    })
    if (role) roleTitle = role.title
  }

  // Create user
  const user = await this.prisma.user.create({
    data: {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      language: dto.language,
      phone: dto.phone,
      roleId: dto.roleId || null,
      role: roleTitle,   // save role directly
    },
  })

  // JWT token
  const token = this.jwtService.sign({
    id: user.id,
    role: roleTitle,
  })

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      phone: user.phone,
      role: roleTitle,
    },
  }
}



async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) throw new UnauthorizedException('Invalid credentials');

  const isMatch = await bcrypt.compare(dto.password, user.password);
  if (!isMatch) throw new UnauthorizedException('Invalid credentials');


  const role = await this.prisma.role.findFirst({
    where: { id: user.roleId },
  });


  const token = this.jwtService.sign({
    id: user.id,
    role: role?.title || 'User',
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      phone: user.phone,
      role: role?.title || 'User',
    },
  };
}


}
