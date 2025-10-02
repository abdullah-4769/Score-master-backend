export class CreateTeamDto {
  name: string
  description?: string
  sessionId: number
  gameFormatId: number
  createdById: number
}
