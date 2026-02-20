import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { CurrentUserPayload } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user, loginDto.farmId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-onboarding')
  async completeOnboarding(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.completeOnboarding(user.userId);
  }

  @Post('firebase-login')
  async firebaseLogin(@Body() body: { email: string; name?: string; avatar?: string; googleId?: string; farmId?: string }) {
    return this.authService.firebaseLogin(body.email, body.name, body.avatar, body.googleId, body.farmId);
  }

  @Post('firebase-register')
  async firebaseRegister(@Body() body: { email: string; name?: string; avatar?: string; googleId?: string }) {
    return this.authService.registerFromFirebase(body.email, body.name, body.avatar, body.googleId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('avatar')
  async updateAvatar(@CurrentUser() user: CurrentUserPayload, @Body() body: { avatar: string }) {
    return this.authService.updateAvatar(user.userId, body.avatar);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.deleteAccount(user.userId);
  }
}
