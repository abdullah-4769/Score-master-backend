import { IsInt, IsOptional, IsJSON } from 'class-validator'

export class CreatePlayerAnswerDto {
  @IsInt()
  playerId: number

  @IsInt()
  facilitatorId: number

  @IsInt()
  sessionId: number

  @IsInt()
  phaseId: number

  @IsInt()
  questionId: number

  @IsOptional()
  @IsJSON()
  answerData?: any
}
