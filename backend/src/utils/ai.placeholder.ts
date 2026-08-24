


const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-1.5-flash"; // Free stable flash model

const callGemini = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${res.status} ${JSON.stringify(errorData)}`);
  }

  const data = (await res.json()) as any;
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Gemini API returned an empty response");
  }

  return rawText;
};

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
  const prompt = `You are an expert technical interviewer. Generate exactly ${count} interview questions for a candidate.
Interview Details:
- Interview Type: ${input.interviewType} (e.g. Technical, HR, Mixed)
- Candidate Role: ${input.role} (e.g. Frontend Developer)
- Target Domain/Skillset: ${input.domain} (e.g. React, Node.js)
- Difficulty Level: ${input.difficulty} (e.g. Beginner, Intermediate, Advanced)
${input.resumeSkills && input.resumeSkills.length > 0 ? `- Candidate Resume Skills: ${input.resumeSkills.join(", ")}` : ""}
${input.resumeProjects && input.resumeProjects.length > 0 ? `- Candidate Resume Projects: ${input.resumeProjects.join(", ")}` : ""}

Instructions:
- Each question must be highly tailored to the role, domain, and difficulty.
- If Candidate Resume Skills are provided, try to align each question with one of those skills and specify that skill in the "sourceSkill" field. If a question is generic or not specifically derived from a resume skill, set "sourceSkill" to null.
- Provide response in JSON matching the exact schema:
{
  "questions": [
    {
      "text": "The text of the question",
      "sourceSkill": "React" // or null
    }
  ]
}`;

  try {
    const rawResult = await callGemini(prompt);
    const parsed = JSON.parse(rawResult);
    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid output shape from Gemini");
    }
    return parsed;
  } catch (error) {
    console.error("Gemini generateQuestions failed, falling back to placeholder:", error);
    const placeholderQuestions: GeneratedQuestion[] = Array.from(
      { length: count },
      (_, i) => ({
        text: `[Fallback] Sample ${input.interviewType} question ${i + 1} for a ${input.role}.`,
        sourceSkill: input.resumeSkills?.[i] || null,
      })
    );
    return { questions: placeholderQuestions };
  }
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
  const prompt = `You are an expert interviewer evaluating a candidate's response.
Interview Context:
- Interview Type: ${input.interviewType}
- Question Asked: ${input.questionText}
- Candidate's Answer: ${input.answerText}

Instructions:
Evaluate the answer and provide:
1. "correctnessScore": Integer from 1 to 10 evaluating technical accuracy, correctness, and depth.
2. "communicationScore": Integer from 1 to 10 evaluating clarity, articulation, and vocabulary.
3. "structureScore": Integer from 1 to 10 evaluating logical progression (e.g., using STAR technique for behavioral, or step-by-step reasoning for technical).
4. "feedback": Constructive, detailed critique of the answer, including what was good, what was missing/incorrect, and how to improve.

Provide response in JSON matching the exact schema:
{
  "correctnessScore": number,
  "communicationScore": number,
  "structureScore": number,
  "feedback": "string"
}`;

  try {
    const rawResult = await callGemini(prompt);
    const parsed = JSON.parse(rawResult);
    if (
      typeof parsed.correctnessScore !== "number" ||
      typeof parsed.communicationScore !== "number" ||
      typeof parsed.structureScore !== "number" ||
      typeof parsed.feedback !== "string"
    ) {
      throw new Error("Invalid output shape from Gemini");
    }
    return parsed;
  } catch (error) {
    console.error("Gemini evaluateResponse failed, falling back to placeholder:", error);
    return {
      correctnessScore: 7,
      communicationScore: 7,
      structureScore: 7,
      feedback: "[Fallback] Decent answer, could use more specific examples.",
    };
  }
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
  const prompt = `You are an expert career coach. Analyze the candidate's complete interview performance and generate a final report.
Interview Details:
- Role: ${input.role}
- Domain: ${input.domain}
- Difficulty: ${input.difficulty}
- Interview Type: ${input.interviewType}

Q&A Session Data:
${JSON.stringify(input.qaPairs, null, 2)}

Instructions:
Based on the QA pairs and individual scores, compile a final report:
1. "overallScore": Integer from 1 to 10 representing overall balanced performance.
2. "correctnessScore": Integer from 1 to 10 representing average correctness.
3. "communicationScore": Integer from 1 to 10 representing average communication.
4. "structureScore": Integer from 1 to 10 representing average structure.
5. "strengths": Array of 2 to 4 bullet points outlining key areas of strength.
6. "weaknesses": Array of 2 to 4 bullet points outlining key areas of weakness.
7. "roadmapText": Detailed, personalized learning roadmap with concrete steps, suggested topics, and projects the candidate should work on to bridge their gaps.

Provide response in JSON matching the exact schema:
{
  "overallScore": number,
  "correctnessScore": number,
  "communicationScore": number,
  "structureScore": number,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "roadmapText": "string"
}`;

  try {
    const rawResult = await callGemini(prompt);
    const parsed = JSON.parse(rawResult);
    if (
      typeof parsed.overallScore !== "number" ||
      typeof parsed.correctnessScore !== "number" ||
      typeof parsed.communicationScore !== "number" ||
      typeof parsed.structureScore !== "number" ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.weaknesses) ||
      typeof parsed.roadmapText !== "string"
    ) {
      throw new Error("Invalid output shape from Gemini");
    }
    return parsed;
  } catch (error) {
    console.error("Gemini generateReport failed, falling back to placeholder:", error);
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
        "[Fallback] Clear communication in most responses.",
        "[Fallback] Good grasp of core concepts.",
      ],
      weaknesses: [
        "[Fallback] Could provide more specific examples.",
        "[Fallback] Some answers lacked structure.",
      ],
      roadmapText:
        "[Fallback] Focus on structuring answers using a clear framework (e.g. situation, action, result) and back up claims with concrete examples from past projects.",
    };
  }
};