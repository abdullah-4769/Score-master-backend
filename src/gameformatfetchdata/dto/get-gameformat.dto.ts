// src/gameformatfetchdata/dto/get-gameformat.dto.ts
import { IsInt } from 'class-validator'

export class GetGameFormatDto {
  @IsInt()
  id: number
}

export class GetPhaseQuestionsDto {
  @IsInt()
  phaseId: number
}
