import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckInByCodeDto } from './dto/check-in-by-code.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  checkIn(
    @Body() dto: CheckInDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.attendanceService.checkIn(dto, user.email);
  }

  @Post('check-in-by-code')
  @UseGuards(JwtAuthGuard)
  checkInByCode(
    @Body() dto: CheckInByCodeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.attendanceService.checkInByCode(
      dto.code,
      user.email,
      dto.latitude,
      dto.longitude,
    );
  }

  @Patch(':id/location')
  @UseGuards(JwtAuthGuard)
  updateLocation(
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.attendanceService.updateAttendanceLocation(
      id,
      user.email,
      body.latitude,
      body.longitude,
    );
  }

  @Get('user/:teamMemberId')
  @UseGuards(JwtAuthGuard)
  getUserAttendanceHistory(
    @Param('teamMemberId') teamMemberId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.attendanceService.getUserAttendanceHistory(
      teamMemberId,
      user.userId,
    );
  }
}
