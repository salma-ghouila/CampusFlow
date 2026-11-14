import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('me')
  updateMe(@CurrentUser() current: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: current.id },
      data: dto,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        program: true,
        level: true,
        weeklyStudyHours: true,
        availability: true,
      },
    });
  }
}