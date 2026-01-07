import { EvaluateQuestionDto } from "../../evaluation/dto/evaluate-question.dto"

export function evaluationPrompt(dto: EvaluateQuestionDto) {
  return `
You are an evaluator AI.
Your job is to assess a player's answer to a question.
Always return only valid JSON, no explanations or extra text outside JSON.

Details:
Scenario: ${dto.scenario || "N/A"}
Question: ${dto.questionText}
Player Answer: ${dto.playerAnswer}
Language: ${dto.language}

Instructions:
- "finalScore" must be a number between 0 and 100
- "relevanceScore" must be a number between 0 and 100
- "suggestion" should be 1–2 short lines
- "qualityAssessment" must be exactly "high", "average", or "low"
- "description" should briefly explain why the score was given
- "scoreBreakdown" must contain 4 fields each scored as "x/25"
- "feedback" should give a simple improvement tip in one one paragraph of 20 words
- give responses in the language specified by the "language" field

Respond ONLY in valid JSON with this structure:

{
  "finalScore": number,
  "relevanceScore": number,
  "suggestion": "string",
  "qualityAssessment": "high" | "average" | "low",
  "description": "string",
  "scoreBreakdown": {
    "charity": "x/25",
    "strategicThinking": "x/25",
    "feasibility": "x/25",
    "innovation": "x/25"
  },
  "feedback": "string"
}
`
}
