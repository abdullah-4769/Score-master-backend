export const questionprompt = (
  type: 'MCQ' | 'OPEN_ENDED' | 'PUZZLE' | 'SIMULATION',
  gameName: string,
  phaseName: string,
  topic?: number,
    language?: string
) => {
  const topicText = topic ? `Topic: "${topic}"` : "No specific topic provided"
  const languageText = language ? `Language: "${language}"` : "No specific language provided"

  let prompt = `
You are generating a ${type} question for a gamified training application.
Game: "${gameName}"
Phase: "${phaseName}"
${topicText}
${languageText}

- For MCQ: provide questionText, options, and mark the correct option(s) in correctSequence
- For Puzzle: provide questionText, sequenceOptions, and correctSequence
- For Simulation: provide scenario and questionText
- For OPEN_ENDED: provide questionText ready for live input, do not include scenario
- for puzzle and simulation, scenario is mandatory
- Include scoringRubric and point
- give resp according to the language provided, if no language provided, use English
- Ensure the question is engaging and relevant to the topic and phase

Return the response strictly as JSON with keys:
{
  "type": "...",
  "scenario": "...",
  "questionText": "...",
  "mcqOptions": [],
  "sequenceOptions": [],
  "correctSequence": [],
  "scoringRubric": {},
  "point": 0
}
`
  return prompt
}
