

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