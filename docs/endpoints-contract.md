# API Contract — Backend HTTP Endpoints

Owner: Akhilesh (Backend & DB)
Status: Draft — pending review from Ayush (AI Integration) & Krishna (Frontend)

This document defines the actual REST endpoints exposed by the backend —
request/response JSON shapes as sent over HTTP. This is distinct from
`API-contract.md`, which covers Ayush's internal AI Service function
signatures (called by the backend, not exposed as routes).

Base URL:
- Local: `http://localhost:5000`
- Staging: `https://interviewforge-nhf2.onrender.com`

All request/response bodies are JSON. All protected routes require an
`Authorization: Bearer <accessToken>` header.

---

## Auth Endpoints

### POST /api/auth/register

**Request**
```json
{
  "name": "Jane Student",
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response — 201 Created**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Jane Student",
    "email": "jane@example.com"
  }
}
```

Notes: `name` must be at least 2 characters (enforced by validation
middleware). Returns `409` if email is already registered.

---

### POST /api/auth/login

**Request**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response — 200 OK**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "name": "Jane Student",
    "email": "jane@example.com"
  }
}
```

Notes: `accessToken` expires in 15 minutes, `refreshToken` in 7 days.
Decoded `accessToken` payload contains `{ userId, role }`.

---

### POST /api/auth/refresh

**Request**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

**Response — 200 OK**
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOi..."
}
```

Notes: Returns `403` if the refresh token was blacklisted (i.e. user
already logged out) or is invalid/expired.

---

### POST /api/auth/logout

Requires: `Authorization: Bearer <accessToken>`

**Request**
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

**Response — 200 OK**
```json
{
  "message": "Logout successful. Token has been revoked."
}
```

Notes: Blacklists the refresh token server-side so it can't be reused,
even if the client doesn't discard it.

---

## Interview Endpoints

All routes below require `Authorization: Bearer <accessToken>`.

### POST /api/interviews

Creates a new interview session.

**Request**
```json
{
  "type": "Technical",
  "role": "Frontend Developer",
  "domain": "Web Development",
  "difficulty": "Intermediate",
  "mode": "text"
}
```

**Response — 201 Created**
```json
{
  "message": "Interview session created",
  "interview": {
    "id": 1,
    "userId": 1,
    "type": "Technical",
    "role": "Frontend Developer",
    "domain": "Web Development",
    "difficulty": "Intermediate",
    "mode": "text",
    "status": "in_progress",
    "startedAt": "2026-08-09T02:02:23.862Z",
    "completedAt": null
  }
}
```

---

### POST /api/interviews/:id/questions

Generates and saves questions for an interview. Empty body.

**Response — 201 Created**
```json
{
  "message": "Questions generated and saved",
  "questions": [
    {
      "id": 1,
      "interviewId": 1,
      "text": "Explain the difference between useEffect and useLayoutEffect.",
      "orderIndex": 0,
      "sourceSkill": "React"
    }
  ]
}
```

Notes: Currently 5 questions generated per call (placeholder AI). Backend
assigns `orderIndex`, AI Service does not.

---

### POST /api/interviews/questions/:id/response

Submits and evaluates an answer to a specific question.

**Request**
```json
{
  "answerText": "useEffect runs after paint, useLayoutEffect runs before paint synchronously."
}
```

**Response — 201 Created**
```json
{
  "message": "Response submitted and evaluated",
  "response": {
    "id": 1,
    "questionId": 1,
    "answerText": "useEffect runs after paint...",
    "correctnessScore": 7,
    "communicationScore": 7,
    "structureScore": 7,
    "feedback": "Decent answer, could use more specific examples."
  }
}
```

Notes: Scores are 0–10 integers, matching the scale used across the whole
AI Service (see `API-contract.md`).

---

### POST /api/interviews/:id/complete

Marks an interview complete and generates the final report. Empty body.

**Response — 201 Created**
```json
{
  "message": "Interview completed and report generated",
  "report": {
    "id": 1,
    "interviewId": 1,
    "overallScore": 7,
    "correctnessScore": 7,
    "communicationScore": 7,
    "structureScore": 7,
    "strengths": [
      "Clear communication in most responses.",
      "Good grasp of core concepts."
    ],
    "weaknesses": [
      "Could provide more specific examples.",
      "Some answers lacked structure."
    ],
    "roadmapText": "Focus on structuring answers using a clear framework..."
  },
  "interview": {
    "id": 1,
    "status": "completed",
    "completedAt": "2026-08-09T02:06:16.569Z"
  }
}
```

Notes: Only questions with a submitted response are included when
calculating scores. Returns `400` if the interview has no answered
questions, or if it's already completed (guards against double-completion).

---

## Common Error Shapes

All error responses follow this shape:

```json
{
  "error": "Human-readable message describing what went wrong"
}
```

| Status | Meaning |
|---|---|
| 400 | Missing/invalid fields, or business-rule violation (e.g. already completed) |
| 401 | Missing or invalid credentials/token |
| 403 | Authenticated but not authorized (e.g. accessing another user's interview) |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 502 | AI Service returned an unexpected/invalid response |
| 500 | Unhandled server error |

---

## Open items for the team

1. **Naming mismatch with `API-contract.md`**: that doc's `generateReport`
   input uses a key called `responses`, but the actual implementation in
   `ai.placeholder.ts` uses `qaPairs`. Ayush — please confirm which name the
   real Gemini integration should use, so backend and AI Service stay in
   sync once placeholders are replaced.
2. Once Ayush's real AI functions replace the placeholders, the response
   shapes for `questions`, `response.feedback`, and `report` fields above
   should stay identical — only the *content* (real AI output vs.
   placeholder text) changes, not the JSON structure. Any structural change
   needs a 3-way sign-off per the task tracker's shared-file rule.