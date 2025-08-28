export class UpdateQuestionDto {
  type?: 'OPEN_ENDED' | 'MCQ' | 'PUZZLE' | 'SIMULATION'
  questionText?: string
  scoringRubric?: object
  order?: number
  point?: number
  mcqOptions?: string[]

}