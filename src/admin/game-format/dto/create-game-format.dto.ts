// src/admin/game-format/dto/create-game-format.dto.ts
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateGameFormatDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  createdById: number; // Admin ID will come from body
}
