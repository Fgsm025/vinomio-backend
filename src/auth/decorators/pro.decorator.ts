import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ProGuard } from '../guards/pro.guard';

export const IsPro = () => applyDecorators(UseGuards(JwtAuthGuard, ProGuard));

