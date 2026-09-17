# InterviewForge AI 🎯

An AI-powered mock interview platform that generates personalized interview questions, evaluates answers in real-time, and produces detailed performance reports with learning roadmaps. Supports text, voice, and live coding interview formats.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| AI | Google Gemini (with automatic model fallback for reliability) |
| File Storage | Supabase Storage |
| Auth | JWT (access + refresh tokens) |
| Code Editor | Monaco Editor (VS Code's editor, in-browser) |
| Speech | Browser Web Speech API (recognition + synthesis) |

## Features

- **AI Question Generation** — Gemini generates role-specific, difficulty-tuned interview questions
- **Resume-Aware Questions** — Upload your resume; AI extracts skills & projects to personalize questions
- **Voice-Enabled Interviews** — Questions are automatically spoken aloud; candidates can answer by typing, speaking, or both in a single unified answer box, with live transcription as they talk
- **Live Coding Interviews** — In-browser Monaco code editor with multi-language support, test case execution, and AI-graded code review (correctness, complexity, quality)
- **Deferred Batch Evaluation** — Answers are saved instantly during the interview; all AI scoring happens together when the interview is completed, keeping the interview flow fast and responsive
- **Real-time Evaluation** — Each answer is scored (0–10) on correctness, communication, and structure
- **Performance Reports** — Session-level report with strengths, weaknesses, and a learning roadmap
- **Interview History & Progress Tracking** — Full history of past sessions with scores, plus a summary showing improvement percentage between a candidate's most recent interview and the one before it
- **Resilient AI Integration** — Automatic fallback across multiple Gemini models if one is slow, rate-limited, or unavailable, keeping response times consistent

## Project Progress

| Phase | Focus | Status |
|------|---------|--------|
| Week 1 — Foundations | DB schema/ERD design, GitHub/Render/Vercel/Supabase setup | ✅ Complete |
| Week 2 — Auth & API Foundation | JWT auth (register/login/refresh/logout), role-based middleware, rate limiting, staging deploy | ✅ Complete |
| Week 3 — Interview Flow Skeleton | Interview session CRUD, question/response endpoints, interview setup & live interview UI | ✅ Complete |
| Week 4 — AI Core Working | Live Gemini integration for question generation, response evaluation, and report synthesis with JSON validation | ✅ Complete |
| Week 5 — Resume-Aware Interviews | Resume upload to Supabase Storage, AI resume parsing, personalized questions based on skills/projects | ✅ Complete |
| Week 6 — Reports & Analytics | Interview history and score-trend endpoints, dashboard and history UI | ✅ Complete |
| Week 7 — QA Pass | Edge-case testing (empty resume, AI failure, abandoned sessions, malformed input), defect fixes, UI polish | ✅ Complete |
| Week 8 — Deployment & Submission | Production hardening, environment/secrets audit, final documentation, advanced features (voice interviews, live coding, mentor-requested improvements) | 🔄 In Progress |

## Advanced Features

### Voice-Enabled Interviews

Every text-based interview question is automatically read aloud using the browser's speech synthesis, with a replay button available at any time. Candidates answer using a single, unified input box that supports typing, speaking, or a mix of both — live transcription appears in the answer box as the candidate speaks, and can be freely edited afterward. If a browser doesn't support speech recognition, the interview gracefully falls back to text-only input with no loss of functionality.

### Live Coding Interviews

Technical interviews can include live coding questions, presented in a full in-browser IDE (Monaco Editor) with syntax highlighting, multiple language support, starter code, and visible test cases. Submitted solutions are evaluated for test case correctness, execution time, and get AI-generated feedback on code quality, time complexity, and space complexity.

### Deferred Evaluation Architecture

To keep the interview experience fast and responsive, individual answers are saved immediately without waiting on AI scoring. When the candidate completes the interview, all answers are evaluated together in a single batch, and the final report is generated from that complete picture — reducing perceived latency during the live interview itself.

### Resilient AI Model Fallback

The AI service automatically tries a prioritized list of Gemini models, switching to the next one within seconds if a model times out, is rate-limited, or is temporarily unavailable — keeping total response time predictable even under model-level disruptions, and "remembering" the last successful model to skip failed attempts on subsequent calls.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase project)
- Google Gemini API key
- Supabase project (for file storage)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, GEMINI_API_KEY, JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install
npx prisma migrate dev
npm run dev
```

> **Note:** `DATABASE_URL` should use Supabase's pooled connection (for normal app queries), and `DIRECT_URL` should use the direct connection (for running migrations) — see `.env.example` for the correct format of each.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout (blacklist refresh token) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |
| PATCH | `/api/auth/profile` | Update display name |
| PATCH | `/api/auth/password` | Change password |
| GET | `/api/interviews` | List user's interviews |
| POST | `/api/interviews` | Create new interview session |
| GET | `/api/interviews/summary` | Get candidate summary — total interviews, average/best score, and improvement percentage vs. previous interview |
| POST | `/api/interviews/:id/questions` | Generate AI questions (resume-aware, text or coding) |
| POST | `/api/interviews/questions/:id/response` | Submit an answer (saved instantly; evaluated on interview completion) |
| POST | `/api/interviews/:id/complete` | Complete interview — batch-evaluates all answers & generates report |
| GET | `/api/interviews/:id/report` | Get interview report |
| DELETE | `/api/interviews/:id` | Delete an interview (and its questions/responses/report) |
| POST | `/api/resumes` | Upload resume (PDF/DOCX) — parses & saves skills |
| GET | `/api/resumes/latest` | Get user's latest parsed resume |

## Team

- **Ayush** — AI Integration (Gemini, resume parsing, model resilience, coding IDE backend)
- **Akhilesh** — Backend (Express, Prisma, Auth, voice interview feature, infrastructure)
- **Krishna** — Frontend (Next.js, UI/UX, coding IDE frontend)