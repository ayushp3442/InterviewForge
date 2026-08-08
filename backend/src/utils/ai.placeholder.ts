

interface GenerateQuestionsInput {
  interviewType: string;
  role: string;
  domain: string;
  difficulty: string;
  resumeSkills?: string[];
  resumeProjects?: string[];
  questionCount?: number;
}

interface GeneratedQuestion {
  text: string;
  sourceSkill: string | null;
}

export const generateQuestions = async (
  input: GenerateQuestionsInput
): Promise<{ questions: GeneratedQuestion[] }> => {
  const count = input.questionCount || 5;
  const placeholderQuestions: GeneratedQuestion[] = Array.from(
    { length: count },
    (_, i) => ({
      text: `[Placeholder] Sample ${input.interviewType} question ${i + 1} for a ${input.role}.`,
      sourceSkill: input.resumeSkills?.[i] || null,
    })
  );

  return { questions: placeholderQuestions };
};


interface EvaluateResponseInput {
  questionText: string;
  answerText: string;
  interviewType: string;
}

interface EvaluatedResponse {
  correctnessScore: number;
  communicationScore: number;
  structureScore: number;
  feedback: string;
}

export const evaluateResponse = async (
  input: EvaluateResponseInput
): Promise<EvaluatedResponse> => {
  return {
    correctnessScore: 7,
    communicationScore: 7,
    structureScore: 7,
    feedback: "[Placeholder] Decent answer, could use more specific examples.",
  };
};