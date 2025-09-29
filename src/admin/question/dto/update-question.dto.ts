export class UpdateQuestionDto {
  type?: 'MCQ' | 'OPEN_ENDED' | 'PUZZLE' | 'SIMULATION'
  scenario?: string
  questionText?: string
  scoringRubric?: object
  order?: number
  point?: number
  mcqOptions?: string[]
  sequenceOptions?: string[]
  correctSequence?: number[]
}
