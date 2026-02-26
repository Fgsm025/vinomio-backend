import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../auth/decorators/roles.decorator';
import { CheckInDto } from './dto/check-in.dto';

const ALLOWED_ROLES = new Set<Role>([Role.OWNER, Role.ADMIN]);
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;
const DUPLICATE_WINDOW_MINUTES = 5;

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureUserCanManageFarm(userId: string, slug: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!farm) {
      throw new NotFoundException(`Farm with slug "${slug}" not found`);
    }
    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId: farm.id } },
      select: { role: true },
    });
    if (!userFarm || !ALLOWED_ROLES.has(userFarm.role as Role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can perform this action');
    }
    return farm;
  }

  private randomCode(): string {
    let result = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      result += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }
    return result;
  }

  async getAttendanceCodeByFarmSlug(slug: string, userId: string) {
    await this.ensureUserCanManageFarm(userId, slug);
    const farm = await this.prisma.farm.findUnique({
      where: { slug },
      select: { id: true },
    });
    const attendanceCode = await this.prisma.attendanceCode.findUnique({
      where: { farmId: farm!.id },
    });
    return attendanceCode ?? null;
  }

  async generateOrRegenerateCode(slug: string, userId: string) {
    const farm = await this.ensureUserCanManageFarm(userId, slug);
    const code = this.randomCode();
    const attendanceCode = await this.prisma.attendanceCode.upsert({
      where: { farmId: farm.id },
      create: { farmId: farm.id, code },
      update: { code },
    });
    return attendanceCode;
  }

  async checkIn(dto: CheckInDto, userEmail: string) {
    const attendanceCode = await this.prisma.attendanceCode.findUnique({
      where: { code: dto.code },
      select: { farmId: true },
    });
    if (!attendanceCode) {
      throw new NotFoundException('Invalid attendance code');
    }
    const teamMember = await this.prisma.teamMember.findFirst({
      where: { farmId: attendanceCode.farmId, email: userEmail },
    });
    if (!teamMember) {
      throw new ForbiddenException('No tienes acceso a esta empresa');
    }
    const since = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000);
    const recent = await this.prisma.attendance.findFirst({
      where: {
        teamMemberId: teamMember.id,
        type: dto.type,
        timestamp: { gte: since },
      },
    });
    if (recent) {
      throw new BadRequestException(
        `A ${dto.type} was already recorded in the last ${DUPLICATE_WINDOW_MINUTES} minutes`,
      );
    }
    const attendance = await this.prisma.attendance.create({
      data: {
        teamMemberId: teamMember.id,
        farmId: attendanceCode.farmId,
        type: dto.type,
        latitude: dto.latitude,
        longitude: dto.longitude,
        method: 'qr',
      },
      include: { teamMember: { select: { name: true } } },
    });
    return attendance;
  }

  async checkInByCode(
    code: string,
    userEmail: string,
    latitude?: number,
    longitude?: number,
  ) {
    const attendanceCode = await this.prisma.attendanceCode.findUnique({
      where: { code },
      include: { farm: { select: { id: true, slug: true, name: true } } },
    });
    if (!attendanceCode) {
      throw new NotFoundException('Invalid attendance code');
    }
    const teamMember = await this.prisma.teamMember.findFirst({
      where: {
        farmId: attendanceCode.farmId,
        email: userEmail,
      },
    });
    if (!teamMember) {
      throw new ForbiddenException('No tienes acceso a esta empresa');
    }
    const since = new Date(
      Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000,
    );
    const recent = await this.prisma.attendance.findFirst({
      where: {
        teamMemberId: teamMember.id,
        type: 'check_in',
        timestamp: { gte: since },
      },
    });
    if (recent) {
      throw new BadRequestException({
        message: 'ALREADY_CHECKED_IN',
        timestamp: recent.timestamp,
      });
    }
    const attendance = await this.prisma.attendance.create({
      data: {
        teamMemberId: teamMember.id,
        farmId: attendanceCode.farmId,
        type: 'check_in',
        latitude,
        longitude,
        method: 'qr',
      },
      include: { teamMember: { select: { name: true } } },
    });
    return {
      attendance,
      farm: {
        slug: attendanceCode.farm.slug,
        name: attendanceCode.farm.name,
      },
    };
  }

  async updateAttendanceLocation(
    attendanceId: string,
    userEmail: string,
    latitude: number,
    longitude: number,
  ) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { teamMember: { select: { email: true } } },
    });
    if (
      !attendance ||
      (attendance.teamMember.email && attendance.teamMember.email !== userEmail)
    ) {
      throw new NotFoundException('Attendance not found');
    }
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { latitude, longitude },
    });
  }

  async getUserAttendanceHistory(teamMemberId: string, userId: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      select: { id: true, farmId: true },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    const userFarm = await this.prisma.userFarm.findUnique({
      where: { userId_farmId: { userId, farmId: teamMember.farmId } },
      select: { role: true },
    });

    if (!userFarm || !ALLOWED_ROLES.has(userFarm.role as Role)) {
      throw new ForbiddenException('Only OWNER or ADMIN can perform this action');
    }

    const records = await this.prisma.attendance.findMany({
      where: { teamMemberId },
      orderBy: { timestamp: 'asc' },
      select: {
        id: true,
        type: true,
        timestamp: true,
        method: true,
      },
    });

    return { records };
  }

  async getAttendanceByFarmSlug(
    slug: string,
    userId: string,
    dateStr?: string,
  ) {
    await this.ensureUserCanManageFarm(userId, slug);
    const farm = await this.prisma.farm.findUnique({
      where: { slug },
      select: { id: true },
    });
    const date = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);
    const list = await this.prisma.attendance.findMany({
      where: {
        farmId: farm!.id,
        timestamp: { gte: start, lte: end },
      },
      include: { teamMember: { select: { name: true } } },
      orderBy: { timestamp: 'asc' },
    });
    return list;
  }
}
