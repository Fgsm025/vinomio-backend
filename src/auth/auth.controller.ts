import { Controller, Get, Post, Put, Patch, Delete, Body, UseGuards, Request, Res } from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { RedeemSubscriptionCouponDto } from './dto/redeem-subscription-coupon.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { CurrentUserPayload } from './decorators/current-user.decorator';
import { setAuthCookie, clearAuthCookie } from './auth-cookie.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: express.Response) {
    const result = await this.authService.register(registerDto);
    setAuthCookie(res, result.access_token);
    return result;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
    const result = await this.authService.login(req.user, loginDto.farmId);
    setAuthCookie(res, result.access_token);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('settings')
  async updateSettings(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateSettingsDto) {
    return this.authService.updateSettings(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete-onboarding')
  async completeOnboarding(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.completeOnboarding(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem-subscription-coupon')
  async redeemSubscriptionCoupon(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RedeemSubscriptionCouponDto,
  ) {
    return this.authService.redeemSubscriptionCoupon(user.userId, dto.code);
  }

  @Post('firebase-login')
  async firebaseLogin(
    @Body()
    body: {
      email: string;
      name?: string;
      avatar?: string;
      googleId?: string;
      farmId?: string;
      firstName?: string;
      lastName?: string;
    },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.authService.firebaseLogin(
      body.email,
      body.name,
      body.avatar,
      body.googleId,
      body.farmId,
      body.firstName,
      body.lastName,
    );
    if (result.access_token) {
      setAuthCookie(res, result.access_token);
    }
    return result;
  }

  @Post('firebase-register')
  async firebaseRegister(
    @Body()
    body: {
      email: string;
      name?: string;
      avatar?: string;
      googleId?: string;
      firstName?: string;
      lastName?: string;
    },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.authService.registerFromFirebase(body.email, body.name, body.avatar, body.googleId, body.firstName, body.lastName);
    setAuthCookie(res, result.access_token);
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    clearAuthCookie(res);
    return { message: 'Logged out' };
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
