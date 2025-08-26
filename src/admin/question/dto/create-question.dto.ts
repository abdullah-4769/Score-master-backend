export class CreateQuestionDto {
  phaseId: string
  type: 'OPEN_ENDED' | 'MULTIPLE_CHOICE'
  questionText: string
  scoringRubric: object
  order: number
}
