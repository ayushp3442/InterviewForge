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

## Shared conventions

- All AI Service functions return **pure JSON**, no markdown fences. Backend
  strips/validates before trusting (see JSON-schema validation, Phase 4).
- Scores are always integers 0–10 across all three functions — one
  consistent scale, no mixing (e.g. no 0–100 anywhere).
- If Gemini output fails schema validation, AI Service retries once with a
  stricter prompt before throwing an error the backend can catch.
- Model used: `gemini-flash-latest` (alias — do not hardcode a dated
  version like `gemini-2.5-flash`, these get deprecated for new projects
  without warning).

---

## Open questions for the team

1. Krishna — does the Live Interview screen need questions delivered one at
   a time, or all 5 upfront? (Affects whether `generateQuestions` is called
   once per session or is a single batch call.)
2. Akhilesh — should score validation (0–10 range check) happen in the AI
   Service layer or the backend controller layer? Proposing AI Service does
   it, since it owns the JSON-schema validation step per the roadmap.