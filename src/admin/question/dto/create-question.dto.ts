export class CreateQuestionDto {
  phaseId: number
  type: 'MCQ' | 'OPEN_ENDED' | 'PUZZLE' | 'SIMULATION'
  questionText?: string
  scoringRubric?: object
  order?: number
  point?: number
    mcqOptions?: string[]
}
