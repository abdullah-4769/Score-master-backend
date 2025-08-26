import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Injectable()
export class PhaseService {
  constructor(private prisma: PrismaService) {}

  // Create phase
  async create(dto: CreatePhaseDto) {
    return this.prisma.phase.create({
      data: {
        name: dto.name,
        description: dto.description,
        order: dto.order,
        scoringType: dto.scoringType,
        gameFormat: {
          connect: { id: dto.gameFormatId }, // connect to existing GameFormat
        },
      },
    });
  }

  // Find all phases
  findAll() {
    return this.prisma.phase.findMany({
      include: { gameFormat: true },
    });
  }

  // Find one phase by ID
  findOne(id: string) {
    return this.prisma.phase.findUnique({
      where: { id },
      include: { gameFormat: true },
    });
  }

  // Update phase
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
        ...(dto.gameFormatId
          ? { gameFormat: { connect: { id: dto.gameFormatId } } }
          : {}),
      },
    });
  }

  // Delete phase
  async remove(id: string) {
    const exists = await this.prisma.phase.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Phase not found');

    return this.prisma.phase.delete({ where: { id } });
  }

// src/admin/phase/phase.service.ts
async removeByFormat(gameFormatId: number) {
  return this.prisma.phase.deleteMany({
    where: { gameFormatId },
  });
}


}
