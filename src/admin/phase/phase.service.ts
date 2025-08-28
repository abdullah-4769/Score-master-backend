// phase.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { ScoringType } from '@prisma/client';
@Injectable()
export class PhaseService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreatePhaseDto) {
  return this.prisma.phase.create({
    data: {
      name: dto.name,
      description: dto.description,
      order: dto.order,
      scoringType: dto.scoringType || ScoringType.AUTOMATIC,
      stages: dto.stages,
      timeDuration: dto.timeDuration,
      gameFormat: { connect: { id: dto.gameFormatId } },
    },
  });
}


  findAll() {
    return this.prisma.phase.findMany({
      include: { gameFormat: true },
    });
  }

  findOne(id: string) {
    return this.prisma.phase.findUnique({
      where: { id },
      include: { gameFormat: true },
    });
  }

  async update(id: string, dto: UpdatePhaseDto) {
    const exists = await this.prisma.phase.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Phase not found');

    return this.prisma.phase.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        order: dto.order,
        scoringType: dto.scoringType,
        stages: dto.stages,
        timeDuration: dto.timeDuration,
        ...(dto.gameFormatId
          ? { gameFormat: { connect: { id: dto.gameFormatId } } }
          : {}),
      },
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.phase.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Phase not found');

    return this.prisma.phase.delete({ where: { id } });
  }

  async removeByFormat(gameFormatId: number) {
    return this.prisma.phase.deleteMany({
      where: { gameFormatId },
    });
  }
}
