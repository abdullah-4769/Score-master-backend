import { IsInt, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  gameFormatId: number;

  @IsInt()
  duration: number;

  @IsInt()
  userId: number;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string; // optional start time in ISO format
}
