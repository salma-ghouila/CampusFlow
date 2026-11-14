import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findMine(@CurrentUser() current: { id: string }) {
    return this.prisma.chapterProgress.findMany({
      where: { userId: current.id },
      select: { chapterId: true, mastery: true, notes: true, updatedAt: true },
    });
  }

  @Put(':chapterId')
  async update(
    @CurrentUser() current: { id: string },
    @Param('chapterId') chapterId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });
    if (!chapter) {
      throw new NotFoundException('Chapitre introuvable');
    }

    return this.prisma.chapterProgress.upsert({
      where: { userId_chapterId: { userId: current.id, chapterId } },
      update: { mastery: dto.mastery, notes: dto.notes },
      create: {
        userId: current.id,
        chapterId,
        mastery: dto.mastery,
        notes: dto.notes,
      },
      select: { chapterId: true, mastery: true, notes: true, updatedAt: true },
    });
  }
}