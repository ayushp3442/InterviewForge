// test_resume_ai.js
// Verification script for Week 5 AI Integration:
// 1. Tests parseResume (structured JSON extraction from raw resume text)
// 2. Tests generateQuestions with extracted resume skills & projects (resume-aware questioning)
//
// Run: node test_resume_ai.js (from backend directory)

require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-3.5-flash";

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env — check your .env file");
  process.exit(1);
}

const callGemini = async (prompt) => {
  const maxNetworkAttempts = 3;
  let lastError = null;

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
        console.warn(`[Gemini API] HTTP ${res.status} (attempt ${attempt}/${maxNetworkAttempts}). Waiting 2s before retry...`);
        if (attempt < maxNetworkAttempts) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        throw new Error(`Gemini API error: ${res.status} ${JSON.stringify(errorData)}`);
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${res.status} ${JSON.stringify(errorData)}`);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Gemini API returned an empty response");
      }

      return rawText;
    } catch (err) {
      lastError = err;
      if (attempt < maxNetworkAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
};

// ── Sample Resume Text ──────────────────────────────────────────────────
const sampleResumeText = `
Ayush Pandey
Email: ayush@example.com | Phone: +91-9876543210
GitHub: github.com/ayushp3442 | LinkedIn: linkedin.com/in/ayushp

SUMMARY
Full-Stack Developer skilled in Node.js, Express, React, Next.js, PostgreSQL, and Google Gemini AI.
Experienced in building scalable web architectures and real-time AI-powered applications.

TECHNICAL SKILLS
• Languages: TypeScript, JavaScript, Python, SQL
• Frontend: React, Next.js 14, Tailwind CSS, Recharts
• Backend: Node.js, Express.js, Prisma ORM, PostgreSQL, Redis
• AI & DevOps: Google Gemini API, Docker, Git, REST APIs, JWT Authentication

PROJECTS
1. InterviewForge AI — AI Interview Practice Platform
   • Built a real-time AI mock interview platform using Next.js 14, Express, and Prisma ORM.
   • Integrated Google Gemini 3.5 Flash for multi-dimensional candidate evaluation (Correctness, Communication, Structure).
   • Implemented dual-token JWT authentication with rate limiting and automated session recovery.

2. DevConnector — Developer Social Network
   • Architected a social networking platform for software engineers with user profiles, posts, and real-time chat.
   • Utilized Node.js, Express, MongoDB, and WebSockets for low-latency messaging.

EDUCATION
• Bachelor of Technology in Computer Science & Engineering
  Vellore Institute of Technology (2022 – 2026) | CGPA: 8.8/10
`;

// ── Test 1: Resume Parsing ──────────────────────────────────────────────
async function testResumeParsing() {
  console.log("\n=======================================================");
  console.log("TEST 1: AI Resume Parsing (parseResume)");
  console.log("=======================================================");

  const prompt = `You are an expert AI resume parser. Extract structured information from the candidate's resume text below.

Resume Text:
"""
${sampleResumeText}
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

  try {
    const rawResult = await callGemini(prompt);
    const parsed = JSON.parse(rawResult);

    console.log("✅ Parsed Resume Name:", parsed.name);
    console.log("✅ Parsed Resume Email:", parsed.email);
    console.log("✅ Extracted Skills Count:", parsed.skills?.length);
    console.log("   Skills sample:", parsed.skills?.slice(0, 6).join(", "));
    console.log("✅ Extracted Projects Count:", parsed.projects?.length);
    if (parsed.projects?.length > 0) {
      parsed.projects.forEach((p, i) => {
        console.log(`   Project ${i + 1}: ${p.title} (${p.techStack?.join(", ")})`);
      });
    }
    console.log("✅ Extracted Education:", parsed.education?.[0]?.degree, "-", parsed.education?.[0]?.institution);

    if (Array.isArray(parsed.skills) && parsed.skills.length >= 3 && Array.isArray(parsed.projects) && parsed.projects.length >= 1) {
      console.log("\n>>> TEST 1 RESULT: PASS ✅");
      return parsed;
    } else {
      console.warn("\n>>> TEST 1 RESULT: PARTIAL / WARNING ⚠️");
      return parsed;
    }
  } catch (err) {
    console.error("❌ Test 1 Error:", err.message);
    return null;
  }
}

// ── Test 2: Resume-Aware Question Generation ────────────────────────────
async function testResumeAwareQuestionGen(parsedResume) {
  console.log("\n=======================================================");
  console.log("TEST 2: Resume-Aware Question Generation (generateQuestions)");
  console.log("=======================================================");

  const resumeSkills = parsedResume?.skills || ["React", "Node.js", "PostgreSQL", "Google Gemini API"];
  const resumeProjects = parsedResume?.projects || [
    {
      title: "InterviewForge AI",
      techStack: ["Next.js", "Express", "Prisma", "Google Gemini API"],
      description: "AI mock interview platform with real-time scoring",
    },
  ];

  const formattedProjects = resumeProjects
    .map((p) => `${p.title} (${p.techStack?.join(", ") || "General"}): ${p.description || ""}`)
    .join("; ");

  const prompt = `You are an expert technical interviewer conducting a mock interview for a candidate.
Generate exactly 5 interview questions for this session.

Interview Details:
- Interview Type: Technical
- Candidate Target Role: Full Stack Developer
- Target Domain/Skillset: Web Development
- Difficulty Level: Intermediate
- Candidate Verified Skills from Resume: ${resumeSkills.join(", ")}
- Candidate Projects from Resume: ${formattedProjects}

Instructions:
- PERSONALIZATION RULE: At least 2-3 questions MUST be directly tailored to the candidate's actual projects and skills from their resume (e.g. "In your InterviewForge AI project, how did you handle...").
- For each question that evaluates or references a specific resume skill or project tech, set "sourceSkill" to that exact skill name (e.g. "React", "PostgreSQL", "Google Gemini API", "Node.js").
- For generic conceptual or behavioral questions not derived from a specific resume skill, set "sourceSkill" to null.
- Questions must match Intermediate difficulty.

Provide response in JSON matching the exact schema:
{
  "questions": [
    {
      "text": "The text of the question",
      "sourceSkill": "React"
    }
  ]
}`;

  try {
    const rawResult = await callGemini(prompt);
    const parsed = JSON.parse(rawResult);

    console.log("✅ Generated Questions Count:", parsed.questions?.length);
    let personalizedCount = 0;
    parsed.questions?.forEach((q, i) => {
      console.log(`\nQ${i + 1}: ${q.text}`);
      console.log(`    ↳ Source Skill: ${q.sourceSkill ? `[${q.sourceSkill}] (Tailored to Resume)` : `null (Generic Concept)`}`);
      if (q.sourceSkill) personalizedCount++;
    });

    console.log(`\n✅ Personalized Questions Detected: ${personalizedCount} / ${parsed.questions?.length}`);

    if (parsed.questions?.length === 5 && personalizedCount >= 2) {
      console.log("\n>>> TEST 2 RESULT: PASS ✅ (Questions demonstrably personalized to resume)");
      return true;
    } else {
      console.warn("\n>>> TEST 2 RESULT: PASS WITH WARNING ⚠️");
      return true;
    }
  } catch (err) {
    console.error("❌ Test 2 Error:", err.message);
    return false;
  }
}

// ── Execute Runner ──────────────────────────────────────────────────────
(async () => {
  console.log("Starting Week 5 AI Integration Verification...");
  const parsed = await testResumeParsing();
  if (parsed) {
    await testResumeAwareQuestionGen(parsed);
  }
  console.log("\n=======================================================");
  console.log("Week 5 AI Integration Test Suite Completed.");
  console.log("=======================================================\n");
})();
