// src/admin/game-format/dto/create-game-format.dto.ts
import { IsBoolean, IsInt, IsOptional, IsString ,IsArray,ArrayNotEmpty,ArrayUnique} from 'class-validator';

export class CreateGameFormatDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  mode: string;

  @IsInt()
  totalPhases: number;


@IsInt()
timeDuration: number; // required, no '?'



  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  createdById: number;

 @IsOptional()
  @IsArray()
  @ArrayNotEmpty()       // optional but if provided, should not be empty
  @ArrayUnique()         // no duplicate IDs
  @IsInt({ each: true }) // ensures every item is an integer
  facilitatorIds?: number[];

}
