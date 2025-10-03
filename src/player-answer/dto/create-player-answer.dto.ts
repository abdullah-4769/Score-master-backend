// src/player-answer/dto/create-player-answer.dto.ts
import { IsInt, IsString, IsOptional } from 'class-validator'

export class CreatePlayerAnswerDto {
  @IsInt()
  playerId: number

  @IsInt()
  sessionId: number

  @IsInt()
  phaseId: number

  @IsInt()
  questionId: number

  @IsInt()
  facilitatorId: number

  @IsOptional()
  @IsString()
  answer?: string
}
