// src/admin/game-format/dto/create-game-format.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateGameFormatDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  mode: string;

  @IsInt()
  totalPhases: number;

  @IsInt()
  timeDuration: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  createdById: number;
}
