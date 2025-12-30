import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @Get('facilitators')
  getAllFacilitators() {
    return this.authService.getAllFacilitators();
  }

  @Get('users')
  getAllUsers() {
    return this.authService.getAllUsers()
  }

    @Post('request-reset')
  async requestReset(@Body() body: any) {
    return this.authService.requestPasswordReset(body.email)
  }

  @Post('confirm-reset')
  async confirmReset(@Body() body: any) {
    return this.authService.confirmPasswordReset(
      body.email,
      body.otp,
      body.newPassword
    )
  }

}
