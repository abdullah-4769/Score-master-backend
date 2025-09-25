import { Injectable,NotFoundException, BadRequestException  } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { ScoringType } from '@prisma/client';

@Injectable()
export class PhaseService {
  constructor(private prisma: PrismaService) {}


 async create(dto: CreatePhaseDto) {
    const gameFormat = await this.prisma.gameFormat.findUnique({
      where: { id: dto.gameFormatId },
      select: { totalPhases: true }
    });

    if (!gameFormat) throw new NotFoundException('Game format not found');

    const existingPhases = await this.prisma.phase.count({
      where: { gameFormatId: dto.gameFormatId },
    });

    if (existingPhases >= gameFormat.totalPhases) {
      throw new BadRequestException(`Cannot add more than ${gameFormat.totalPhases} phases`);
    }

    try {
      return await this.prisma.phase.create({
        data: {
          name: dto.name,
          description: dto.description,
          order: dto.order,
          scoringType: dto.scoringType || ScoringType.AUTOMATIC,
          timeDuration: dto.timeDuration,
          challengeTypes: dto.challengeTypes || [],
          difficulty: dto.difficulty?.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD' || 'EASY',
          badge: dto.badge,
          requiredScore: dto.requiredScore,
          gameFormat: { connect: { id: dto.gameFormatId } },
        },
      });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }


 async update(id: number, dto: UpdatePhaseDto) {
    const phase = await this.prisma.phase.findUnique({ where: { id } })
    if (!phase) throw new NotFoundException('Phase not found')

    return this.prisma.phase.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        order: dto.order,
        scoringType: dto.scoringType,
        timeDuration: dto.timeDuration,
        challengeTypes: dto.challengeTypes,
        difficulty: dto.difficulty,
        badge: dto.badge,
        requiredScore: dto.requiredScore,
        ...(dto.gameFormatId ? { gameFormat: { connect: { id: dto.gameFormatId } } } : {}),
      },
    })
  }


  findAll() {
    return this.prisma.phase.findMany({
      include: { gameFormat: true },
    });
  }


  async findOne(id: number) {
    const phase = await this.prisma.phase.findUnique({
      where: { id },
      include: { gameFormat: true },
    })

    if (!phase) throw new NotFoundException('Phase not found')
    return phase
  }

  async remove(id: number) {
    const exists = await this.prisma.phase.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Phase not found');

    return this.prisma.phase.delete({ where: { id } });
  }


  async removeByFormat(gameFormatId: number) {
    return this.prisma.phase.deleteMany({
      where: { gameFormatId },
    });
  }




async findByGameFormat(gameFormatId: number) {
  const phases = await this.prisma.phase.findMany({
    where: { gameFormatId },
    orderBy: { order: 'asc' },
  });

  return phases.map(phase => {
    const typesCount = phase.challengeTypes?.length || 0
    const stagesCount = typesCount 

    return {
      id: phase.id,
      name: phase.name,
      challengeTypes: phase.challengeTypes,
      timeDuration: phase.timeDuration,
      stagesCount
    }
  })
}




}
