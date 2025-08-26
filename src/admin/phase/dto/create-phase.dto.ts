export class CreatePhaseDto {
  gameFormatId: number  // match GameFormat.id type
  name: string
  description?: string
  order: number
  scoringType: 'AUTOMATIC' | 'MANUAL'
}
