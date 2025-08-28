// create-phase.dto.ts
import { ScoringType } from '@prisma/client';

export class CreatePhaseDto {
  gameFormatId: number
  name: string
  description?: string
  order: number
  scoringType?: ScoringType  // use Prisma enum
  stages: number
  timeDuration: number
 
}
