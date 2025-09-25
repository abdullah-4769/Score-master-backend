import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  gameFormatId: number;

  @IsInt()
  duration: number;

  @IsInt()
  userId: number; 
}
