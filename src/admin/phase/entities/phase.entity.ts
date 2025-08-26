import { ScoringType } from '@prisma/client';

export class Phase {
  id: string;
  gameFormatId: string;
  name: string;
  description?: string;
  order: number;
  scoringType: ScoringType;
  createdAt: Date;
  updatedAt: Date;
}
