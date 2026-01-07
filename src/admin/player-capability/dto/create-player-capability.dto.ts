import { IsInt, IsOptional, IsBoolean, IsArray } from 'class-validator'

export class CreatePlayerCapabilityDto {
  @IsInt()
  gameFormatId: number

  @IsInt()
  minPlayers: number

  @IsInt()
  maxPlayers: number

  @IsOptional()
  @IsArray()
  badgeNames?: string[]

  @IsOptional()
  @IsBoolean()
  requireAllTrue?: boolean

  @IsOptional()
  @IsBoolean()
  aiScoring?: boolean

  @IsOptional()
  @IsBoolean()
  allowLaterJoin?: boolean

  @IsOptional()
  @IsBoolean()
  sendInvitation?: boolean

  @IsOptional()
  @IsBoolean()
  recordSession?: boolean
}
