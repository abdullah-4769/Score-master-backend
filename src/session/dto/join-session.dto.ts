import { IsNotEmpty, IsInt } from 'class-validator';

export class JoinSessionDto {
  @IsNotEmpty()
  joinCode: string;

  @IsInt()
  playerId: number; // temporary, until you use JWT auth
}
