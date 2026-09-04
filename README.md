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

| Week | Feature | Status |
|------|---------|--------|
| Week 1 | Auth (register/login/logout), JWT middleware, rate limiting | ✅ Complete |
| Week 2 | Frontend auth pages wired to real API | ✅ Complete |
| Week 3 | Interview CRUD, interview setup page | ✅ Complete |
| Week 4 | Gemini AI integration — question gen, evaluation, report gen | ✅ Complete |
| Week 5 | Resume upload (PDF/DOCX), AI parsing, resume-aware questions | ✅ Complete |

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
| GET | `/api/interviews` | List user's interviews |
| POST | `/api/interviews` | Create new interview session |
| POST | `/api/interviews/:id/questions` | Generate AI questions (resume-aware) |
| POST | `/api/interviews/questions/:id/response` | Submit + evaluate answer |
| POST | `/api/interviews/:id/complete` | Complete interview & generate report |
| GET | `/api/interviews/:id/report` | Get interview report |
| POST | `/api/resumes` | Upload resume (PDF/DOCX) — parses & saves skills |
| GET | `/api/resumes/latest` | Get user's latest parsed resume |

## Team

- **Ayush** — AI Integration (Gemini, resume parsing)
- **Akhilesh** — Backend (Express, Prisma, Auth)
- **Krishna** — Frontend (Next.js, UI/UX)
