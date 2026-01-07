import { IsInt } from 'class-validator';

export class IncreaseSessionTimeDto {
  @IsInt()
  additionalSeconds: number
}
