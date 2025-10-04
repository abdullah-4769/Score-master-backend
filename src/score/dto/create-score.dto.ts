export class CreateScoreDto {
  questionId: number
  playerId: number
  sessionId: number
  phaseId: number
  finalScore: number
  relevanceScore: number
  suggestion: string
  qualityAssessment: string
  description: string
  charityScore: number
  strategicThinking: number
  feasibilityScore: number
  innovationScore: number
  points: number
  playerAnswerId?: number
}
