

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

interface QAPair {
  questionText: string;
  answerText: string;
  correctnessScore: number | null;
  communicationScore: number | null;
  structureScore: number | null;
}

interface GenerateReportInput {
  interviewType: string;
  role: string;
  domain: string;
  difficulty: string;
  qaPairs: QAPair[];
}

interface GeneratedReport {
  overallScore: number;
  correctnessScore: number;
  communicationScore: number;
  structureScore: number;
  strengths: string[];
  weaknesses: string[];
  roadmapText: string;
}

export const generateReport = async (
  input: GenerateReportInput
): Promise<GeneratedReport> => {
  const average = (values: number[]) =>
    values.length > 0
      ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
      : 0;

  const correctnessScore = average(
    input.qaPairs.map((qa) => qa.correctnessScore ?? 0)
  );
  const communicationScore = average(
    input.qaPairs.map((qa) => qa.communicationScore ?? 0)
  );
  const structureScore = average(
    input.qaPairs.map((qa) => qa.structureScore ?? 0)
  );
  const overallScore = average([
    correctnessScore,
    communicationScore,
    structureScore,
  ]);

  return {
    overallScore,
    correctnessScore,
    communicationScore,
    structureScore,
    strengths: [
      "[Placeholder] Clear communication in most responses.",
      "[Placeholder] Good grasp of core concepts.",
    ],
    weaknesses: [
      "[Placeholder] Could provide more specific examples.",
      "[Placeholder] Some answers lacked structure.",
    ],
    roadmapText:
      "[Placeholder] Focus on structuring answers using a clear framework (e.g. situation, action, result) and back up claims with concrete examples from past projects.",
  };
};