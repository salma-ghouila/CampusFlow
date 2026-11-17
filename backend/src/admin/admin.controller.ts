import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async stats() {
    const [users, subjects, chapters, suspended] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subject.count(),
      this.prisma.chapter.count(),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
    ]);
    return { users, subjects, chapters, suspended };
  }

  @Get('users')
  users() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        program: true,
        level: true,
        createdAt: true,
      },
    });
  }

  @Patch('users/:id/status')
  async updateStatus(
    @CurrentUser() current: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    if (id === current.id) {
      throw new BadRequestException('Tu ne peux pas modifier ton propre compte');
    }
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: { id: true, fullName: true, email: true, role: true, status: true },
    });
  }
}