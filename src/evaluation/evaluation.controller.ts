import { Body, Controller, Post } from "@nestjs/common"
import { EvaluationService } from "./evaluation.service"
import { EvaluateQuestionDto } from "./dto/evaluate-question.dto"

@Controller("evaluation")
export class EvaluationController {
  constructor(private readonly service: EvaluationService) {}

  @Post("evaluate")
  async evaluate(@Body() dto: EvaluateQuestionDto) {
    return this.service.evaluate(dto)
  }
}
