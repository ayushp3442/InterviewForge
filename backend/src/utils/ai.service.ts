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
const MODEL = "gemini-2.0-flash";
const MAX_RETRIES = 1; // Retry once on validation failure, per API contract

// ── Gemini HTTP caller ──────────────────────────────────────────────────

const callGemini = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const maxNetworkAttempts = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxNetworkAttempts; attempt++) {
    try {
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

      if (res.status === 503 || res.status === 429) {
        const errorData = await res.json().catch(() => ({}));
        console.warn(`[Gemini API] HTTP ${res.status} encountered (attempt ${attempt}/${maxNetworkAttempts}). Retrying after delay...`);
        if (attempt < maxNetworkAttempts) {
          await new Promise((r) => setTimeout(r, attempt * 1500));
          continue;
        }
        throw new Error(`Gemini API error: ${res.status} ${JSON.stringify(errorData)}`);
      }

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
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxNetworkAttempts && (lastError.message.includes("503") || lastError.message.includes("429"))) {
        await new Promise((r) => setTimeout(r, attempt * 1500));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error("Gemini API request failed");
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

export interface GenerateQuestionsInput {
  interviewType: string;
  role: string;
  domain: string;
  difficulty: string;
  resumeSkills?: string[];
  resumeProjects?: Array<{ title: string; techStack?: string[]; description?: string }> | string[];
  questionCount?: number;
}

export interface GeneratedQuestion {
  text: string;
  sourceSkill: string | null;
}

export interface EvaluateResponseInput {
  questionText: string;
  answerText: string;
  interviewType: string;
}

export interface EvaluatedResponse {
  correctnessScore: number;
  communicationScore: number;
  structureScore: number;
  feedback: string;
}

export interface QAPair {
  questionText: string;
  answerText: string;
  correctnessScore: number | null;
  communicationScore: number | null;
  structureScore: number | null;
}

export interface GenerateReportInput {
  interviewType: string;
  role: string;
  domain: string;
  difficulty: string;
  qaPairs: QAPair[];
}

export interface GeneratedReport {
  overallScore: number;
  correctnessScore: number;
  communicationScore: number;
  structureScore: number;
  strengths: string[];
  weaknesses: string[];
  roadmapText: string;
}

export interface ParsedResumeProject {
  title: string;
  techStack: string[];
  description: string;
}

export interface ParsedResumeExperience {
  role: string;
  company: string;
  duration: string | null;
}

export interface ParsedResumeEducation {
  degree: string;
  institution: string;
  year: string | null;
}

export interface ParsedResumeData {
  name: string | null;
  email: string | null;
  skills: string[];
  projects: ParsedResumeProject[];
  experience: ParsedResumeExperience[];
  education: ParsedResumeEducation[];
}

// ── 1. parseResume ──────────────────────────────────────────────────────

export const parseResume = async (
  rawText: string
): Promise<ParsedResumeData> => {
  const prompt = `You are an expert AI resume parser. Extract structured information from the candidate's resume text below.

Resume Text:
"""
${rawText}
"""

Instructions:
Extract the following structured fields:
1. "name": Full name of the candidate (string, or null if not found).
2. "email": Email address of the candidate (string, or null if not found).
3. "skills": Array of distinct technical and professional skills, tools, frameworks, and programming languages (array of strings).
4. "projects": Array of projects mentioned in the resume. Each project must have:
   - "title": Title/name of the project (string).
   - "techStack": Array of technologies/libraries used in the project (array of strings).
   - "description": 1-2 sentence summary of what the project does (string).
5. "experience": Array of work experience / internships. Each item must have:
   - "role": Job title (string).
   - "company": Company name (string).
   - "duration": Duration or timeframe (string, or null).
6. "education": Array of degrees/institutions. Each item must have:
   - "degree": Degree name or field of study (string).
   - "institution": University / College name (string).
   - "year": Graduation year or timeframe (string, or null).

Provide response in JSON matching the exact schema:
{
  "name": "string | null",
  "email": "string | null",
  "skills": ["string"],
  "projects": [
    {
      "title": "string",
      "techStack": ["string"],
      "description": "string"
    }
  ],
  "experience": [
    {
      "role": "string",
      "company": "string",
      "duration": "string | null"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string | null"
    }
  ]
}`;

  const validateResume = (parsed: any): ParsedResumeData => {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Parsed resume output must be a JSON object");
    }

    const name = typeof parsed.name === "string" && parsed.name.trim().length > 0 ? parsed.name.trim() : null;
    const email = typeof parsed.email === "string" && parsed.email.trim().length > 0 ? parsed.email.trim() : null;
    const skills = Array.isArray(parsed.skills)
      ? parsed.skills.filter((s: any) => typeof s === "string" && s.trim().length > 0).map((s: string) => s.trim())
      : [];

    const projects: ParsedResumeProject[] = Array.isArray(parsed.projects)
      ? parsed.projects.map((p: any, i: number) => ({
          title: typeof p.title === "string" && p.title.trim().length > 0 ? p.title.trim() : `Project ${i + 1}`,
          techStack: Array.isArray(p.techStack)
            ? p.techStack.filter((t: any) => typeof t === "string" && t.trim().length > 0).map((t: string) => t.trim())
            : [],
          description: typeof p.description === "string" ? p.description.trim() : "",
        }))
      : [];

    const experience: ParsedResumeExperience[] = Array.isArray(parsed.experience)
      ? parsed.experience.map((e: any) => ({
          role: typeof e.role === "string" ? e.role.trim() : "Position",
          company: typeof e.company === "string" ? e.company.trim() : "Company",
          duration: typeof e.duration === "string" && e.duration.trim().length > 0 ? e.duration.trim() : null,
        }))
      : [];

    const education: ParsedResumeEducation[] = Array.isArray(parsed.education)
      ? parsed.education.map((ed: any) => ({
          degree: typeof ed.degree === "string" ? ed.degree.trim() : "Degree",
          institution: typeof ed.institution === "string" ? ed.institution.trim() : "Institution",
          year: typeof ed.year === "string" && ed.year.trim().length > 0 ? ed.year.trim() : null,
        }))
      : [];

    return {
      name,
      email,
      skills,
      projects,
      experience,
      education,
    };
  };

  return callGeminiWithValidation(prompt, validateResume);
};

// ── 2. generateQuestions ────────────────────────────────────────────────

export const generateQuestions = async (
  input: GenerateQuestionsInput
): Promise<{ questions: GeneratedQuestion[] }> => {
  const count = input.questionCount || 5;

  const hasResume =
    (input.resumeSkills && input.resumeSkills.length > 0) ||
    (input.resumeProjects && Array.isArray(input.resumeProjects) && input.resumeProjects.length > 0);

  const formattedProjects = Array.isArray(input.resumeProjects)
    ? input.resumeProjects.map((p) => (typeof p === "string" ? p : `${p.title} (${p.techStack?.join(", ") || "General"}): ${p.description || ""}`)).join("; ")
    : "";

  const prompt = `You are an expert technical interviewer conducting a mock interview for a candidate.
Generate exactly ${count} interview questions for this session.

Interview Details:
- Interview Type: ${input.interviewType} (e.g. Technical, HR, Mixed)
- Candidate Target Role: ${input.role} (e.g. Frontend Developer, Backend Developer, Full Stack Developer)
- Target Domain/Skillset: ${input.domain}
- Difficulty Level: ${input.difficulty} (e.g. Beginner, Intermediate, Advanced)
${input.resumeSkills && input.resumeSkills.length > 0 ? `- Candidate Verified Skills from Resume: ${input.resumeSkills.join(", ")}` : ""}
${formattedProjects ? `- Candidate Projects from Resume: ${formattedProjects}` : ""}

Instructions:
${
  hasResume
    ? `- PERSONALIZATION RULE: At least 2-3 questions MUST be directly tailored to the candidate's actual projects and skills from their resume (e.g. "I see you worked on [Project Title] with [Tech]. How did you handle [challenge/design]?" or "In your [Project Title] project, why did you decide to use [Tech] over alternatives?").
- For each question that evaluates or references a specific resume skill or project tech, set "sourceSkill" to that exact skill name (e.g. "React", "PostgreSQL", "Docker", "Node.js").
- For generic conceptual or behavioral questions not derived from a specific resume skill, set "sourceSkill" to null.`
    : `- Generate high-quality, relevant questions tailored to the specified role, domain, and difficulty level.
- Set "sourceSkill" to null for each question.`
}
- Questions must match the specified difficulty: Beginner (fundamentals and syntax), Intermediate (practical patterns, tradeoffs, architecture), Advanced (system design, edge cases, scaling, performance optimization).

Provide response in JSON matching the exact schema:
{
  "questions": [
    {
      "text": "The text of the question",
      "sourceSkill": "React" // exact skill name or null
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

// ── 3. evaluateResponse ─────────────────────────────────────────────────

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
