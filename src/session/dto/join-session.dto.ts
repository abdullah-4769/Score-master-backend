import { IsNotEmpty, IsInt } from 'class-validator';

export class JoinSessionDto {
  @IsNotEmpty()
  joinCode: string;

  @IsInt()
  playerId: number;
}
