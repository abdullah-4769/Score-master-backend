import { Injectable } from "@nestjs/common"
import { EvaluateQuestionDto } from "./dto/evaluate-question.dto"
import { llm } from "../lib/llm/llm"
import { evaluationPrompt } from "../lib/prompt/evaluation.prompt"
import { HumanMessage } from "@langchain/core/messages"

@Injectable()
export class EvaluationService {
  async evaluate(dto: EvaluateQuestionDto) {
    const prompt = evaluationPrompt(dto)

    const response = await llm.call([new HumanMessage(prompt)])

    const cleaned = response.text
      .trim()
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")

    try {
      return JSON.parse(cleaned)
    } catch (e) {
      return {
        error: "Failed to parse AI evaluation",
        raw: cleaned,
      }
    }
  }
}
