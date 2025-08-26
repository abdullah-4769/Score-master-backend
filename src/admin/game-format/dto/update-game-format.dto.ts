import { PartialType } from '@nestjs/mapped-types';
import { CreateGameFormatDto } from './create-game-format.dto';

export class UpdateGameFormatDto extends PartialType(CreateGameFormatDto) {}
