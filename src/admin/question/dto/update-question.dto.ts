export class UpdateQuestionDto {
  type?: 'OPEN_ENDED' | 'MULTIPLE_CHOICE'
  questionText?: string
  scoringRubric?: object
  order?: number
}
