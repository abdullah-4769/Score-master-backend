import { PartialType } from '@nestjs/mapped-types'
import { CreatePlayerCapabilityDto } from './create-player-capability.dto'

export class UpdatePlayerCapabilityDto extends PartialType(CreatePlayerCapabilityDto) {}
