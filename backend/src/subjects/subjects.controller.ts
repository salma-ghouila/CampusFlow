import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findMine(@CurrentUser() current: { id: string }) {
    return this.prisma.subject.findMany({
      where: { ownerId: current.id },
      orderBy: { name: 'asc' },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });
  }

  @Post()
  create(@CurrentUser() current: { id: string }, @Body() dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: { name: dto.name.trim(), ownerId: current.id },
      include: { chapters: true },
    });
  }

  @Delete(':id')
  async remove(@CurrentUser() current: { id: string }, @Param('id') id: string) {
    await this.getOwned(id, current.id);
    await this.prisma.subject.delete({ where: { id } });
    return { deleted: true };
  }

  @Post(':id/chapters')
  async addChapter(
    @CurrentUser() current: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateChapterDto,
  ) {
    await this.getOwned(id, current.id);
    const last = await this.prisma.chapter.findFirst({
      where: { subjectId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    return this.prisma.chapter.create({
      data: { title: dto.title.trim(), order: (last?.order ?? 0) + 1, subjectId: id },
    });
  }

  @Delete(':id/chapters/:chapterId')
  async removeChapter(
    @CurrentUser() current: { id: string },
    @Param('id') id: string,
    @Param('chapterId') chapterId: string,
  ) {
    await this.getOwned(id, current.id);
    const chapter = await this.prisma.chapter.findFirst({
      where: { id: chapterId, subjectId: id },
    });
    if (!chapter) throw new NotFoundException('Chapitre introuvable');
    await this.prisma.chapter.delete({ where: { id: chapterId } });
    return { deleted: true };
  }

  private async getOwned(id: string, userId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, ownerId: userId },
    });
    if (!subject) throw new NotFoundException('Matière introuvable');
    return subject;
  }
}