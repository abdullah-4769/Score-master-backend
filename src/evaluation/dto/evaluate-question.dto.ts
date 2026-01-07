import { IsString, IsOptional, IsObject } from "class-validator"

export class EvaluateQuestionDto {
  @IsOptional()
  @IsString()
  scenario?: string

  @IsString()
  questionText: string


  @IsString()
  playerAnswer: string

  @IsString()
  language: string

}
