/**
 * AI Service Module — InterviewForge
 * Owner: Ayush (AI Integration)
 *
 * Wraps Gemini 3.5 Flash for:
 *   1. generateQuestions  — tailored interview question generation
 *   2. evaluateResponse   — per-question scoring + feedback
 *   3. generateReport     — session-level report with roadmap
 *
 * Implements:
 *   - JSON-schema validation for every AI response
 *   - Score range enforcement (0–10 integers)
 *   - One automatic retry with a stricter prompt on validation failure
 *   - Clean error propagation (no silent fallbacks)
 */

// ── Config ──────────────────────────────────────────────────────────────

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.5-flash";
const MAX_RETRIES = 1; // Retry once on validation failure, per API contract

// ── Gemini HTTP caller ──────────────────────────────────────────────────

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

// ── Validation Helpers ──────────────────────────────────────────────────

/**
 * Clamp a score to the valid 0–10 integer range.
 * Rounds floats and constrains out-of-bound values.
 */
const clampScore = (value: unknown): number => {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`Expected a number score, got ${typeof value}: ${value}`);
  }
  return Math.max(0, Math.min(10, Math.round(value)));
};

/**
 * Validate that a value is a non-empty string.
 */
const assertString = (value: unknown, fieldName: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`"${fieldName}" must be a non-empty string, got: ${typeof value}`);
  }
  return value.trim();
};

/**
 * Validate that a value is a non-empty array of strings.
 */
const assertStringArray = (value: unknown, fieldName: string, minLen = 1): string[] => {
  if (!Array.isArray(value) || value.length < minLen) {
    throw new Error(`"${fieldName}" must be an array with at least ${minLen} items`);
  }
  return value.map((item, i) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new Error(`"${fieldName}[${i}]" must be a non-empty string`);
    }
    return item.trim();
  });
};

// ── Retry wrapper ───────────────────────────────────────────────────────

/**
 * Calls Gemini, parses JSON, runs a validator function.
 * On validation failure, retries once with a stricter prompt suffix.
 * On second failure, throws the validation error (no silent fallback).
 */
async function callGeminiWithValidation<T>(
  prompt: string,
  validator: (parsed: any) => T
): Promise<T> {
  const strictSuffix = `

IMPORTANT: Your previous response did not match the required JSON schema. 
You MUST respond with ONLY valid JSON matching the exact schema specified above. 
All score fields MUST be integers between 0 and 10 inclusive. 
Do NOT include any text outside the JSON object.`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const finalPrompt = attempt === 0 ? prompt : prompt + strictSuffix;

    try {
      const rawResult = await callGemini(finalPrompt);
      const parsed = JSON.parse(rawResult);
      return validator(parsed);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `AI validation attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        lastError.message
      );
    }
  }

  // Both attempts failed — throw, don't silently fallback
  throw new Error(
    `AI service failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`
  );
}

// ── Types ───────────────────────────────────────────────────────────────

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

// ── 1. generateQuestions ────────────────────────────────────────────────

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

  const validateQuestions = (parsed: any): { questions: GeneratedQuestion[] } => {
    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error("Response must contain a 'questions' array");
    }

    if (parsed.questions.length < 1) {
      throw new Error("'questions' array must have at least 1 item");
    }

    const validatedQuestions: GeneratedQuestion[] = parsed.questions.map(
      (q: any, i: number) => {
        const text = assertString(q.text, `questions[${i}].text`);
        const sourceSkill =
          q.sourceSkill === null || q.sourceSkill === undefined
            ? null
            : assertString(q.sourceSkill, `questions[${i}].sourceSkill`);
        return { text, sourceSkill };
      }
    );

    return { questions: validatedQuestions };
  };

  return callGeminiWithValidation(prompt, validateQuestions);
};

// ── 2. evaluateResponse ─────────────────────────────────────────────────

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
1. "correctnessScore": Integer from 0 to 10 evaluating technical accuracy, correctness, and depth.
2. "communicationScore": Integer from 0 to 10 evaluating clarity, articulation, and vocabulary.
3. "structureScore": Integer from 0 to 10 evaluating logical progression (e.g., using STAR technique for behavioral, or step-by-step reasoning for technical).
4. "feedback": Constructive, detailed critique of the answer, including what was good, what was missing/incorrect, and how to improve.

All scores MUST be integers between 0 and 10 inclusive.

Provide response in JSON matching the exact schema:
{
  "correctnessScore": number,
  "communicationScore": number,
  "structureScore": number,
  "feedback": "string"
}`;

  const validateEvaluation = (parsed: any): EvaluatedResponse => ({
    correctnessScore: clampScore(parsed.correctnessScore),
    communicationScore: clampScore(parsed.communicationScore),
    structureScore: clampScore(parsed.structureScore),
    feedback: assertString(parsed.feedback, "feedback"),
  });

  return callGeminiWithValidation(prompt, validateEvaluation);
};

// ── 3. generateReport ───────────────────────────────────────────────────

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
1. "overallScore": Integer from 0 to 10 representing overall balanced performance.
2. "correctnessScore": Integer from 0 to 10 representing average correctness.
3. "communicationScore": Integer from 0 to 10 representing average communication.
4. "structureScore": Integer from 0 to 10 representing average structure.
5. "strengths": Array of 2 to 4 bullet points outlining key areas of strength.
6. "weaknesses": Array of 2 to 4 bullet points outlining key areas of weakness.
7. "roadmapText": Detailed, personalized learning roadmap with concrete steps, suggested topics, and projects the candidate should work on to bridge their gaps.

All scores MUST be integers between 0 and 10 inclusive.

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

  const validateReport = (parsed: any): GeneratedReport => ({
    overallScore: clampScore(parsed.overallScore),
    correctnessScore: clampScore(parsed.correctnessScore),
    communicationScore: clampScore(parsed.communicationScore),
    structureScore: clampScore(parsed.structureScore),
    strengths: assertStringArray(parsed.strengths, "strengths", 2),
    weaknesses: assertStringArray(parsed.weaknesses, "weaknesses", 2),
    roadmapText: assertString(parsed.roadmapText, "roadmapText"),
  });

  return callGeminiWithValidation(prompt, validateReport);
};
