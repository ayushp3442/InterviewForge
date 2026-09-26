# InterviewForge AI 🎯
> **Production-Grade AI Mock Interview & Sandboxed Coding Assessment Platform**

InterviewForge AI is an advanced, full-stack mock interview ecosystem engineered to replicate real-world FAANG/Tier-1 tech hiring rounds. The platform combines **resume-tailored conversational questioning**, **real-time voice interviews with speech-to-text transcription**, and an in-browser **LeetCode-grade Monaco Coding IDE** driven by a secure, containerized judge engine with automated Big-O complexity analysis and downloadable PDF scorecards.

---

## 📑 Table of Contents
1. [Platform Overview & Problem Statement](#-platform-overview--problem-statement)
2. [Feature Matrix: Traditional vs InterviewForge](#-feature-matrix-traditional-vs-interviewforge)
3. [System Architecture & Data Flow](#-system-architecture--data-flow)
4. [Technology Stack Matrix](#-technology-stack-matrix)
5. [Database Schema & Entity Relationship](#-database-schema--entity-relationship)
6. [Sandboxed Coding Judge Architecture](#-sandboxed-coding-judge-architecture)
7. [Environment Variables Dictionary](#-environment-variables-dictionary)
8. [Step-by-Step Installation & Local Setup](#-step-by-step-installation--local-setup)
9. [Candidate Journey & User Workflow](#-candidate-journey--user-workflow)
10. [Complete REST API Reference](#-complete-rest-api-reference)
11. [Automated Testing & Verification](#-automated-testing--verification)
12. [Troubleshooting & FAQ](#-troubleshooting--faq)
13. [Contributors & Team Roles](#-contributors--team-roles)

---

## 💡 Platform Overview & Problem Statement

### The Problem
* **Generic Questions:** Most mock interview tools ask pre-baked static questions unrelated to the candidate’s real project experience.
* **Flawed Code Judges:** Naive coding clones compare literal terminal outputs, causing timing/closure utilities like `debounce` to fail (due to `[Function (anonymous)]` vs `"function"` mismatches) or allowing candidates to bypass tests via `print("function")`.
* **Superficial Feedback:** Existing platforms output vague scores without explaining algorithmic Big-O complexities or communication clarity.

### The InterviewForge Solution
InterviewForge unifies **Resume Parsing**, **Voice Q&A**, **Two-Tier Code Execution**, and **LLM Mentor Evaluations** into a cohesive, responsive hiring simulator.

---

## 📊 Feature Matrix: Traditional vs InterviewForge

| Capability | Traditional Mock Platforms | LeetCode / HackerRank | InterviewForge AI |
|---|:---:|:---:|:---:|
| **Question Personalization** | Static database lookup | Fixed problem sets | **Dynamic (Resume Skills + Target Role)** |
| **Voice Interaction** | Rare / Third-party add-on | Not available | **Native Web Speech (TTS & STT)** |
| **Coding Interface** | Simple textarea | Monaco / Ace Editor | **Monaco Editor (VS Code in-browser)** |
| **Code Execution Model** | Host `eval` / Unsafe `vm` | Multi-language container | **Judge0 Container Sandbox + Resource Caps** |
| **Closure & Behavioral Testing** | ❌ Fails (string matching) | Varies | **✅ Semantic Behavior Runner (Timers/Args)** |
| **Big-O Complexity Review** | ❌ Static solution hints | ❌ Runtime graph only | **✅ Dynamic Gemini AI Time & Space Review** |
| **Session Reports** | Simple Pass/Fail | Runtime percentile | **Detailed PDF Roadmap + Recharts Analytics** |

---

## 🏗️ System Architecture & Data Flow

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               CLIENT LAYER (Next.js 14)                                │
│   ┌────────────────────┐   ┌──────────────────────┐   ┌────────────────────────────┐   │
│   │   Monaco Editor    │   │    Web Speech API    │   │    Recharts & jsPDF        │   │
│   │ (Code Editing/IDE) │   │ (Voice Recognition)  │   │  (Analytics & PDF Export)  │   │
│   └─────────┬──────────┘   └──────────┬───────────┘   └──────────────┬─────────────┘   │
└─────────────┼─────────────────────────┼──────────────────────────────┼─────────────────┘
              │                         │                              │
              ▼                         ▼                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY & BACKEND (Node.js / Express TS)                    │
│   ┌────────────────────┐   ┌──────────────────────┐   ┌────────────────────────────┐   │
│   │ Helmet & RateLimit │   │ JWT Auth Middleware  │   │   Controllers & Services   │   │
│   └────────────────────┘   └──────────────────────┘   └──────────────┬─────────────┘   │
└──────────────────────────────────────────────────────────────────────┼─────────────────┘
                                                                       │
           ┌───────────────────────────┬───────────────────────────────┴───────────────────────────┐
           │                           │                                                           │
           ▼                           ▼                                                           ▼
┌───────────────────────┐   ┌───────────────────────┐                                   ┌───────────────────────┐
│     DATABASE LAYER    │   │   AI INTELLIGENCE     │                                   │     SANDBOX JUDGE     │
│  PostgreSQL (Supabase)│   │ Google Gemini 2.5     │                                   │ Judge0 / Piston       │
│  Supavisor Pool :6543 │   │ - Resume Parser       │                                   │ Docker Containers     │
│  Prisma ORM Client    │   │ - Dynamic Question Gen│                                   │ - Memory: 64MB        │
│  Supabase Storage     │   │ - Big-O Code Reviewer │                                   │ - Timeout: 10s        │
│  (Resumes Bucket)     │   │ - Model Auto-Fallback │                                   │ - Network Isolated    │
└───────────────────────┘   └───────────────────────┘                                   └───────────────────────┘
```

---

## 🛠️ Technology Stack Matrix

| Category | Technology | Version / Spec | Engineering Rationale |
|---|---|---|---|
| **Frontend Framework** | Next.js | `14.2.5` | Hybrid App Router architecture with optimized client/server split |
| **Frontend Library** | React | `^18.0.0` | Declarative UI state management and hook lifecycle control |
| **Language** | TypeScript | `^5.0.0` | End-to-end interface typing preventing runtime null/type bugs |
| **CSS & Design** | Tailwind CSS | `^3.4.19` | Modern dark-mode palette, responsive grid system, and micro-interactions |
| **Motion & Animation** | Framer Motion | `^13.0.0` | Hardware-accelerated card transitions and fluid modal animations |
| **Code Editor** | Monaco Editor | `^4.7.0` | Exact editor engine powering VS Code (syntax coloring, indentation) |
| **Data Visualization** | Recharts | `^3.10.1` | SVG-based responsive score breakdown and radar/bar telemetry |
| **Document Export** | jsPDF / html2canvas | `^4.2.1` / `^1.4.1` | Client-side vector and canvas generation for PDF scorecards |
| **Backend Framework** | Express.js | `^5.2.1` | Lightweight, high-throughput asynchronous REST routing engine |
| **Database Engine** | PostgreSQL | `15+` (Supabase) | ACID-compliant relational persistence with complex foreign key joins |
| **Database Pooler** | Supavisor Pooler | Port `6543` / `5432` | Prevents serverless connection exhaustion via transaction pooling |
| **ORM Client** | Prisma | `^5.22.0` | Type-safe schema definition, automated migrations, and relations |
| **AI LLM Engine** | Google Gemini | `2.5 Flash` | Sub-second latency, structured JSON responses, and resume parsing |
| **Code Sandbox** | Judge0 / Piston | Containerized | Zero host-machine access; hard process limits and memory isolation |
| **Authentication** | JWT & bcrypt | `^9.0.3` / `^6.0.0` | Dual-token authentication with 10-round salted password hashing |
| **Security Headers** | Helmet | `^8.3.0` | Enforces CSP, XSS filtering, Frameguard, and HSTS headers |
| **Rate Limiter** | express-rate-limit | `^8.6.2` | IP-based request throttling against DDoS and submission abuse |
| **File Parser** | `pdf-parse` / `mammoth` | `^2.4.5` / `^1.12.2` | Dual text extractors for `.pdf` and `.docx` candidate resumes |

---

## 🗄️ Database Schema & Entity Relationship

Prisma models define relational integrity across all candidate actions:

| Model | Purpose | Primary Fields | Key Relationships |
|---|---|---|---|
| **`User`** | System candidate profile | `id`, `name`, `email`, `passwordHash`, `role` | Has many `Resume`, `Interview`, `CodeSubmission` |
| **`Resume`** | Uploaded candidate resume | `id`, `userId`, `fileUrl`, `parsedJson`, `uploadedAt` | Belongs to `User` |
| **`Interview`** | Mock interview session | `id`, `userId`, `role`, `difficulty`, `status`, `startedAt` | Belongs to `User`, Has many `Question`, Has one `Report` |
| **`Question`** | Generated interview item | `id`, `interviewId`, `text`, `questionType` (`TEXT`/`CODING`) | Belongs to `Interview`, Has one `Response`, Has one `CodingProblem` |
| **`Response`** | Candidate's verbal/text answer | `id`, `questionId`, `answerText`, `correctnessScore`, `communicationScore` | Belongs to `Question` |
| **`CodingProblem`** | Algorithmic / coding task | `id`, `questionId`, `title`, `description`, `starterCode`, `testCases` | Belongs to `Question`, Has many `CodeSubmission` |
| **`CodeSubmission`** | Code attempt & telemetry | `id`, `codingProblemId`, `language`, `code`, `timeComplexity`, `feedback` | Belongs to `CodingProblem`, `Question`, and `User` |
| **`Report`** | Final session report | `id`, `interviewId`, `overallScore`, `strengths`, `weaknesses`, `roadmapText` | Belongs to `Interview` |

---

## ⚡ Sandboxed Coding Judge Architecture

InterviewForge solves the fundamental limitation of standard judge clones by deploying **Two Independent Evaluation Pipelines**:

| Feature | Pipeline A: Standard Stdin/Stdout | Pipeline B: Semantic Function-Behavior |
|---|---|---|
| **Target Problem Type** | Algorithmic (Two Sum, Merge Intervals, Palindrome) | Functional Utilities (Debounce, Throttle, Memoize, Curry) |
| **Candidate Input** | Parameters passed via `stdin` or function invocation | Implementation of closure/wrapper function |
| **Execution Tool** | [`language-harness.ts`](file:///c:/Users/AYUSH%20PANDEY/InterView%20Forge/backend/src/utils/code-runner/language-harness.ts) | [`function-behavior-runner.ts`](file:///c:/Users/AYUSH%20PANDEY/InterView%20Forge/backend/src/utils/code-runner/function-behavior-runner.ts) |
| **Verification Logic** | Multi-mode comparator (`exact`, `json`, `boolean`, `float`) | Semantic timing simulation (`setTimeout`, `time.sleep`) |
| **Output Type** | Text stdout | Single structured JSON message: `{ "pass": true }` |
| **Print Hack Vulnerability** | Standard string matching | **Immune** (Checks callable symbol, invocation counts, arguments) |

### Sandbox Security Controls
* **Execution Timeout:** Strict **10-second ceiling** (`SIGKILL` issued automatically on infinite loops).
* **Memory Quota:** **64 MB maximum RAM** per container process.
* **Network Blackhole:** Inbound and outbound socket connections disabled inside the sandbox container.
* **Code Size Limit:** Submissions capped at **64 KB** to protect parser memory.

---

## 🔑 Environment Variables Dictionary

### Backend Configuration (`backend/.env`)

| Variable | Required? | Example Value | Description |
|---|:---:|---|---|
| `PORT` | Optional | `5000` | Port on which the Express server listens (default: 5000) |
| `NODE_ENV` | Required | `development` | Environment mode (`development` or `production`) |
| `FRONTEND_URL` | Required | `http://localhost:3000` | Whitelisted CORS origin allowed to access backend APIs |
| `DATABASE_URL` | Required | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase Supavisor pooler connection string (Port 6543) |
| `DIRECT_URL` | Required | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres` | Direct/session connection URL used by Prisma migrations |
| `JWT_SECRET` | Required | `kP9xmW3vR7sN2tQ8jL4cF6hB1dY5gA0eZ` | Cryptographic secret for signing short-lived access tokens |
| `JWT_REFRESH_SECRET` | Required | `mT7wX2vK9pJ4nR6qL1cF8hB3dY0gA5eS` | Cryptographic secret for signing long-lived refresh tokens |
| `GEMINI_API_KEY` | Required | `AIzaSy...` | Google AI Studio API Key for Gemini 2.5 Flash |
| `SUPABASE_URL` | Required | `https://[REF].supabase.co` | Supabase project REST URL for storage bucket uploads |
| `SUPABASE_SERVICE_KEY` | Required | `eyJhbGciOi...` | Supabase Service Role Key with administrative storage permissions |

### Frontend Configuration (`frontend/.env.local`)

| Variable | Required? | Example Value | Description |
|---|:---:|---|---|
| `NEXT_PUBLIC_API_URL` | Required | `http://localhost:5000/api` | Base URL used by client-side fetchers to call the backend |

---

## 🚀 Step-by-Step Installation & Local Setup

### 1. System Prerequisites
* **Node.js:** v18.0.0 or higher ([Download](https://nodejs.org/))
* **Git:** Installed and configured ([Download](https://git-scm.com/))
* **PostgreSQL:** Local PostgreSQL or cloud [Supabase](https://supabase.com/) project
* **Gemini API Key:** From [Google AI Studio](https://aistudio.google.com/)

---

### 2. Clone the Repository
```bash
git clone https://github.com/ayushp3442/InterviewForge.git
cd InterviewForge
```

---

### 3. Backend Setup & Startup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create and configure .env file
cp .env.example .env
# (Open .env and paste your Supabase pooler credentials and Gemini API Key)

# Push the schema to your database
npx prisma db push

# Start backend development server
npm run dev
```
*Backend starts on:* **`http://localhost:5000`** *(Healthcheck: `http://localhost:5000/`)*

---

### 4. Frontend Setup & Startup
```bash
# Open a new terminal tab and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create and configure environment file
cp .env.local.example .env.local

# Start Next.js development server
npm run dev
```
*Frontend starts on:* **`http://localhost:3000`**

### Port Allocation Summary

| Service | Port | Local URL | Health Endpoint |
|---|---|---|---|
| **Frontend Web App** | `3000` | `http://localhost:3000` | `http://localhost:3000` |
| **Backend REST API** | `5000` | `http://localhost:5000` | `http://localhost:5000/` |
| **Supabase Pooler** | `6543` / `5432` | Cloud Hosted (`pooler.supabase.com`) | Managed by Supabase |

---

## 🔄 Candidate Journey & User Workflow

| Stage | Candidate Action | System & AI Background Action | Output to Candidate |
|---|---|---|---|
| **1. Auth** | Signs up / logs in | Passwords hashed with `bcrypt`; JWT tokens issued | Redirect to Dashboard |
| **2. Resume Setup** | Uploads `.pdf` or `.docx` resume | `pdf-parse` / `mammoth` extracts text; Gemini identifies skills | Skill badges displayed on profile |
| **3. Configure** | Chooses role (e.g. Frontend) & difficulty | Query constructed with candidate resume context | Interview session initiated |
| **4. Voice Round** | Listens to question; answers verbally | Web Speech API transcribes voice live; audio replayed via TTS | Real-time text in unified answer box |
| **5. Coding Round** | Solves problem in Monaco Editor | Code evaluated in Judge0; timers tested via behavior runner | Instant Test Case Pass/Fail + diffs |
| **6. AI Review** | Submits coding problem | Gemini calculates Big-O Time & Space complexity | Detailed code quality score (1–10) |
| **7. Final Report** | Clicks "Complete Interview" | Batch evaluation runs; summary report compiled | Downloadable PDF report + radar charts |

---

## 📡 Complete REST API Reference

### 🔐 Authentication Module (`/api/auth`)

| Method | Endpoint | Auth | Request Body | Response Payload | Description |
|---|---|:---:|---|---|---|
| `POST` | `/api/auth/register` | None | `{ name, email, password }` | `{ message, user }` | Create new candidate account |
| `POST` | `/api/auth/login` | None | `{ email, password }` | `{ accessToken, refreshToken, user }` | Authenticate user & issue tokens |
| `POST` | `/api/auth/refresh` | None | `{ refreshToken }` | `{ accessToken, refreshToken }` | Re-issue expired access token |
| `POST` | `/api/auth/logout` | Bearer | `{ refreshToken }` | `{ message }` | Revoke session & token |
| `GET` | `/api/auth/me` | Bearer | None | `{ user }` | Fetch active user credentials |

---

### 📄 Resume Management (`/api/resumes`)

| Method | Endpoint | Auth | Request Body | Response Payload | Description |
|---|---|:---:|---|---|---|
| `POST` | `/api/resumes` | Bearer | `multipart/form-data` (`file`) | `{ resume, parsedSkills }` | Upload & extract resume text |
| `GET` | `/api/resumes/latest` | Bearer | None | `{ resume }` | Retrieve latest active resume |

---

### 🎙️ Interview Management (`/api/interviews`)

| Method | Endpoint | Auth | Request Body | Response Payload | Description |
|---|---|:---:|---|---|---|
| `POST` | `/api/interviews` | Bearer | `{ role, difficulty, type }` | `{ interview }` | Create new interview session |
| `GET` | `/api/interviews` | Bearer | None | `{ interviews: [...] }` | List candidate interview history |
| `GET` | `/api/interviews/summary` | Bearer | None | `{ totalInterviews, averageScore }` | Aggregate analytics metrics |
| `POST` | `/api/interviews/:id/questions`| Bearer | None | `{ questions: [...] }` | Trigger Gemini question generation |
| `POST` | `/api/interviews/questions/:id/response` | Bearer | `{ answerText }` | `{ response }` | Save answer (deferred scoring) |
| `POST` | `/api/interviews/:id/complete` | Bearer | None | `{ report }` | Run batch evaluation & generate report |
| `GET` | `/api/interviews/:id/report` | Bearer | None | `{ report }` | Fetch completed interview report |

---

### 💻 Sandboxed Coding Engine (`/api/coding`)

| Method | Endpoint | Auth | Request Body | Response Payload | Description |
|---|---|:---:|---|---|---|
| `GET` | `/api/coding/runtimes` | None | None | `{ runtimes: [...] }` | List supported compilers & versions |
| `POST` | `/api/coding/:problemId/run` | Bearer | `{ language, code, testCaseIndex }` | `{ status, passed, actualOutput }` | Test code against single visible testcase |
| `POST` | `/api/coding/:problemId/submit` | Bearer | `{ language, code }` | `{ passedAll, timeComplexity, feedback }`| Evaluate against all tests + AI review |

---

## 🧪 Automated Testing & Verification

InterviewForge contains a dedicated regression test suite validating the judge pipeline across edge cases and languages:

```bash
cd backend
npx tsx tests/judge-regression.test.ts
```

### Test Suite Execution Matrix (59/59 Passed)

| Test Case | Scenario Tested | Input Solution | Expected Outcome | Actual Result |
|---|---|---|---|:---:|
| **CASE 1** | Debounce Full Spec | Standard closure with `clearTimeout` | Pass all 9 timer/delay checks | **PASSED** |
| **CASE 2** | Immediate Execution Bug | Calls callback synchronously | Fail early execution checks | **PASSED** |
| **CASE 3** | Empty Execution Bug | Never invokes original callback | Fail execution verification | **PASSED** |
| **CASE 4** | Missing ClearTimeout Bug | Omits `clearTimeout(timer)` | Fail rapid multi-call checks | **PASSED** |
| **CASE 5** | JavaScript Print Hack | `console.log("function")` | Fail identifier check | **PASSED** |
| **CASE 6** | Python Print Hack | `print("function")` | Fail callable symbol check | **PASSED** |
| **CASE 6b**| Python Valid Debounce | `threading.Timer` closure in Python | Pass Python behavioral test | **PASSED** |
| **CASE 7** | Normal Stdin/Stdout | JSON arrays, floats, booleans, whitespace | Match normalized outputs | **PASSED** |
| **CASE 8** | Malicious / Infinite Loop | `while(true) {}` inside candidate code | Terminate safely via timeout | **PASSED** |

---

## ❓ Troubleshooting & FAQ

| Problem Observed | Root Cause | Verified Solution |
|---|---|---|
| `Can't reach database server at db...supabase.co:5432` | Direct Supabase domain resolves IPv6-only on many local ISPs | Use Supabase Connection Pooler (`aws-0-[region].pooler.supabase.com:6543?pgbouncer=true`) |
| `tenant/user not found` during DB connection | Wrong AWS region specified in pooler host | Verify project region (e.g. `ap-southeast-1`) and use `postgres.[PROJECT_REF]` as username |
| `SpeechRecognition is not defined` | Browser does not natively support Web Speech API | System automatically falls back to keyboard input; use Chromium/Chrome for voice |
| `Execution timed out` on coding submission | Candidate submission contains infinite recursion or loop | Safe sandbox behavior; container terminates process after 10s and outputs "Time Limit Exceeded" |
| `Code quality score null` on submit | Gemini API quota exceeded or missing API key | Non-blocking architecture; submission records successfully with raw test case scores intact |

---

## 👥 Contributors & Team Roles

* **Ayush** — AI Systems & Architecture *(Gemini integration, multi-model fallback, Monaco IDE, function-behavior judge)*
* **Akhilesh** — Backend & Infrastructure *(Express TypeScript, Prisma ORM, Supabase pooler, JWT security, voice APIs)*
* **Krishna** — Frontend & UI/UX *(Next.js 14, Tailwind CSS, Monaco editor client, Recharts, jsPDF scorecard export)*

---

## 📄 License
This project is open-source under the [ISC License](LICENSE).