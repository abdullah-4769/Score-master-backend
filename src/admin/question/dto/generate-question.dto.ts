export class GenerateQuestionDto {
  topic?: number
  type: 'MCQ' | 'OPEN_ENDED' | 'PUZZLE' | 'SIMULATION'
  gameName: string
  phaseName: string
    language?: string
}
