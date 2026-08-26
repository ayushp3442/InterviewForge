# API Contract — AI Service Module

Owner: Ayush (AI Integration)
Status: Draft — pending review from Akhilesh (Backend) & Krishna (Frontend)

This document defines the request/response JSON shapes for the three core AI
service functions. These are internal function contracts (called by the
backend, not raw HTTP endpoints) — the backend wraps these with actual
Express routes.

---

## 1. generateQuestions

Called when: an Interview session starts (Week 3/4), and again in Week 5
once resume data is available.

### Input

```json
{
  "interviewType": "Technical",
  "role": "Frontend Developer",
  "domain": "Web Development",
  "difficulty": "Intermediate",
  "resumeSkills": ["React", "Node.js", "PostgreSQL"],
  "resumeProjects": ["E-commerce dashboard", "Chat app with WebSockets"],
  "questionCount": 5
}
```

Notes:
- `resumeSkills` / `resumeProjects` are optional — empty arrays in Week 3/4
  before resume parsing exists (Phase 5). Function must work with or
  without them (falls back to generic role-based questions if empty).
- `interviewType` matches `Interview.type` in schema (e.g. "Technical", "HR")

### Output

```json
{
  "questions": [
    {
      "text": "Explain the difference between useEffect and useLayoutEffect.",
      "sourceSkill": "React"
    },
    {
      "text": "Tell me about a time you handled a tight deadline.",
      "sourceSkill": null
    }
  ]
}
```

Notes:
- `sourceSkill: null` for generic/HR questions not tied to a specific resume
  skill — maps directly to `Question.sourceSkill` (nullable) in schema.
- Backend assigns `orderIndex` when inserting into DB — not the AI's job.

---

## 2. evaluateResponse

Called when: student submits an answer to a question during a live session.

### Input

```json
{
  "questionText": "Explain the difference between useEffect and useLayoutEffect.",
  "answerText": "useEffect runs after paint, useLayoutEffect runs before paint synchronously...",
  "interviewType": "Technical"
}
```

### Output

```json
{
  "correctnessScore": 8,
  "communicationScore": 7,
  "structureScore": 6,
  "feedback": "Good grasp of the core difference, but the answer could mention a concrete use case like measuring DOM elements before paint."
}
```

Notes:
- All three scores are **0–10 integers** — maps directly to
  `Response.correctnessScore` / `communicationScore` / `structureScore`.
- `feedback` maps to `Response.feedback` (String).
- JSON-schema validation required before backend stores this (Phase 4
  requirement) — reject and retry once if any score is missing or out of
  range.

---

## 3. generateReport

Called when: interview session is marked complete (all questions answered).

### Input

```json
{
  "interviewType": "Technical",
  "role": "Frontend Developer",
  "responses": [
    {
      "questionText": "Explain useEffect vs useLayoutEffect.",
      "answerText": "...",
      "correctnessScore": 8,
      "communicationScore": 7,
      "structureScore": 6
    }
  ]
}
```

Notes:
- `responses` is the full array of Q&A + scores from the session — backend
  fetches these from DB and passes them in, AI does not re-score here.

### Output

```json
{
  "overallScore": 7,
  "correctnessScore": 7,
  "communicationScore": 6,
  "structureScore": 6,
  "strengths": [
    "Strong understanding of React lifecycle and hooks",
    "Clear, concise explanations"
  ],
  "weaknesses": [
    "Limited depth on performance optimization topics",
    "Answers could include more concrete examples"
  ],
  "roadmapText": "Focus next on React performance patterns (memoization, virtualization) and practice walking through real project examples out loud to build communication fluency under time pressure."
}
```

Notes:
- `overallScore` / `correctnessScore` / `communicationScore` / `structureScore`
  are session-level **averages**, 0–10 — maps to `Report` table fields.
- `strengths` / `weaknesses` are arrays → stored as `Json` in schema (not
  String) — frontend renders as bullet lists directly, no parsing needed.
- `roadmapText` stays a single prose string (matches schema) — not a list.

---

## 4. parseResume (NEW — Phase 5)

Called when: student uploads a resume PDF/DOCX at `/resume-upload`. Backend
extracts raw text (e.g. via `pdf-parse`) and passes the text string into this AI function.

### Input

```json
{
  "rawText": "Jane Student\njane@example.com\nSkills: React, Node.js, PostgreSQL, Docker\nProjects:\n• E-commerce Platform: Built full-stack store with Next.js and Prisma...\nEducation: B.Tech Computer Science (2025)"
}
```

### Output

```json
{
  "name": "Jane Student",
  "email": "jane@example.com",
  "skills": ["React", "Node.js", "PostgreSQL", "Docker"],
  "projects": [
    {
      "title": "E-commerce Platform",
      "techStack": ["Next.js", "Prisma", "PostgreSQL"],
      "description": "Built full-stack store with Next.js and Prisma"
    }
  ],
  "experience": [],
  "education": [
    {
      "degree": "B.Tech Computer Science",
      "institution": "University Institute of Technology",
      "year": "2025"
    }
  ]
}
```

Notes:
- `skills` is an array of strings → saved in `Resume.parsedJson.skills`.
- `projects` is an array of project objects (`title`, `techStack`, `description`) → saved in `Resume.parsedJson.projects`.
- Both `skills` and `projects` from this output are passed directly into `generateQuestions` (Section 1) during interview sessions.
- Backend stores the complete JSON in `Resume.parsedJson` in PostgreSQL.
- Frontend review/edit screen (`/resume-upload`) receives this JSON so the candidate can add, remove, or edit skills before starting their interview session.

---

## Shared conventions

- All AI Service functions return **pure JSON**, no markdown fences. Backend
  strips/validates before trusting (see JSON-schema validation, Phase 4).
- Scores are always integers 0–10 across all scoring functions — one
  consistent scale, no mixing (e.g. no 0–100 anywhere).
- If Gemini output fails schema validation, AI Service retries once with a
  stricter prompt before throwing an error the backend can catch.
- Model used: `gemini-3.5-flash`.

---

## Team Handover Notes

1. **Akhilesh (Backend):** When creating `POST /api/resumes/upload`, extract text from the uploaded PDF using `pdf-parse` and call `parseResume(rawText)`. Save the result into `prisma.resume.create({ data: { userId, fileUrl, parsedJson } })`. In `addQuestionsToInterview`, fetch `user.resumes[0].parsedJson` and pass `resumeSkills` and `resumeProjects` to `generateQuestions()`.
2. **Krishna (Frontend):** In `/resume-upload`, render the returned `skills` array as editable tags so candidates can review, add, or remove skills before starting an interview session.