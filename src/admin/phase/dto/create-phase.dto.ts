import { ScoringType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { DifficultyLevel } from '@prisma/client';

export class CreatePhaseDto {
  @IsInt()
  gameFormatId: number

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsInt()
  order: number

  @IsOptional()
  @IsEnum(ScoringType)
  scoringType?: ScoringType

  @IsInt()
  timeDuration: number

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  challengeTypes?: string[]

  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel

  @IsOptional()
  @IsString()
  badge?: string

  @IsOptional()
  @IsInt()
  requiredScore?: number
}
