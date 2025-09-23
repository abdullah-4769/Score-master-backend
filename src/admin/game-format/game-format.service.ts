import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { CreateGameFormatDto } from './dto/create-game-format.dto';
import { UpdateGameFormatDto } from './dto/update-game-format.dto';

@Injectable()
export class GameFormatService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGameFormatDto) {
  return this.prisma.gameFormat.create({
    data: {
      name: dto.name,
      description: dto.description,
      mode: dto.mode,
      totalPhases: dto.totalPhases,
      timeDuration: dto.timeDuration,
      isPublished: dto.isPublished ?? false,
      isActive: dto.isActive ?? true,
      createdById: dto.createdById,
      facilitators: dto.facilitatorIds
        ? {
            connect: dto.facilitatorIds.map((id) => ({ id })),
          }
        : undefined,
    },
  });
}


  async findAll() {
    return this.prisma.gameFormat.findMany({
      where: { isActive: true },
      include: { createdBy: true , facilitators: true}, // include facilitators relation
    });
  }

 async findOne(id: number) {
  const format = await this.prisma.gameFormat.findUnique({
    where: { id },
    include: { 
      createdBy: true,
      facilitators: true, // include facilitators relation
    },
  });
  if (!format) throw new NotFoundException('Game format not found');
  return format;
}

  async update(id: number, dto: UpdateGameFormatDto) {
    return this.prisma.gameFormat.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        mode: dto.mode,
        totalPhases: dto.totalPhases,
        timeDuration: dto.timeDuration,
        isPublished: dto.isPublished,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.gameFormat.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async publish(id: number) {
    return this.prisma.gameFormat.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async findByFacilitatorId(facilitatorId: number) {
    return this.prisma.gameFormat.findMany({
      where: {
        facilitators: {
          some: {
            id: facilitatorId
          }
        }
      },
      include: {
        createdBy: true,
        facilitators: true
      }
    });
  }







}
