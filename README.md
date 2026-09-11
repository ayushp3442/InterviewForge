# InterviewForge AI 🎯

An AI-powered mock interview platform that generates personalized interview questions, evaluates answers in real-time, and produces detailed performance reports with learning roadmaps.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Supabase) via Prisma ORM |
| AI | Google Gemini 3.5 Flash |
| File Storage | Supabase Storage |
| Auth | JWT (access + refresh tokens) |

## Features

- **AI Question Generation** — Gemini generates role-specific, difficulty-tuned interview questions
- **Resume-Aware Questions** — Upload your resume; AI extracts skills & projects to personalize questions
- **Real-time Evaluation** — Each answer is scored (0–10) on correctness, communication, and structure
- **Performance Reports** — Session-level report with strengths, weaknesses, and a learning roadmap
- **Interview History** — Full history of past sessions with scores

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
| Week 8 — Deployment & Submission | Production hardening, environment/secrets audit, final documentation | 🔄 In Progress |


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
# Fill in DATABASE_URL, GEMINI_API_KEY, JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install
npx prisma migrate deploy
npm run dev
```

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
| POST | `/api/interviews/:id/questions` | Generate AI questions (resume-aware) |
| POST | `/api/interviews/questions/:id/response` | Submit + evaluate answer |
| POST | `/api/interviews/:id/complete` | Complete interview & generate report |
| GET | `/api/interviews/:id/report` | Get interview report |
| DELETE | `/api/interviews/:id` | Delete an interview (and its questions/responses/report) |
| POST | `/api/resumes` | Upload resume (PDF/DOCX) — parses & saves skills |
| GET | `/api/resumes/latest` | Get user's latest parsed resume |

## Team

- **Ayush** — AI Integration (Gemini, resume parsing)
- **Akhilesh** — Backend (Express, Prisma, Auth)
- **Krishna** — Frontend (Next.js, UI/UX)
