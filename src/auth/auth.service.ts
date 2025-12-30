import { Injectable, UnauthorizedException ,BadRequestException} from '@nestjs/common'
import { PrismaService } from '../lib/prisma/prisma.service'
import { JwtService } from '../lib/jwt/jwt.service'
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // Determine role
    const roleTitle = dto.role || (dto.roleId ? await this.getRoleTitle(dto.roleId) : 'User')

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        language: dto.language,
        phone: dto.phone,
        roleId: dto.roleId || null,
        role: roleTitle,
      },
    })

    const token = this.jwtService.sign({ id: user.id, role: roleTitle })

    return {
      token,
      user: this.mapUser(user, roleTitle),
    }
  }

async login(dto: LoginDto) {
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email }
  })

  if (!user) throw new UnauthorizedException('Invalid credentials')

  if (user.suspended) {
    throw new UnauthorizedException('Account is suspended')
  }

  const isMatch = await bcrypt.compare(dto.password, user.password)
  if (!isMatch) throw new UnauthorizedException('Invalid credentials')

  const roleTitle = user.role || 'User'
  const token = this.jwtService.sign({ id: user.id, role: roleTitle })

  return {
    token,
    user: this.mapUser(user, roleTitle)
  }
}


  private async getRoleTitle(roleId: number) {
    const role = await this.prisma.role.findFirst({ where: { id: roleId } })
    return role?.title || 'User'
  }

  private mapUser(user: any, role: string) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      language: user.language,
      phone: user.phone,
      role,
    }
  }



async getAllFacilitators() {
  const facilitators = await this.prisma.user.findMany({
    where: { role: 'facilitator' },
    select: {
      id: true,
      name: true,
      email: true,
      language: true,
      phone: true
    }
  });

  return facilitators;
}

async getAllUsers() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      language: true,
      suspended: true,
      phone: true,
      role: true
    }
  })
}

 async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!user) throw new BadRequestException('User not found')

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await this.prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000)
      }
    })

    return {
      message: 'OTP generated',
      otp
    }
  }

  async confirmPasswordReset(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!user) throw new BadRequestException('User not found')

    if (!user.resetOtp || user.resetOtp !== otp) {
      throw new BadRequestException('Invalid OTP')
    }

if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date()) {
  throw new BadRequestException('OTP expired')
}


    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null
      }
    })

    return {
      message: 'Password reset successful'
    }
  }
}
