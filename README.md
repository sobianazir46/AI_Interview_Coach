# AI Interview Coach

<div align="center">
<img width="1200" height="475" alt="AI Interview Coach Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

**Personalized, AI-driven interview preparation — powered by Google Gemini**

[![Live App](https://img.shields.io/badge/Live-Frontend-blue?style=flat-square)](https://ai-interview-coach-six-opal.vercel.app/)
[![API](https://img.shields.io/badge/Live-Backend%20API-green?style=flat-square)](https://ai-interview-coach-backend-nfu8.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square)]()

[Live Demo](https://ai-interview-coach-six-opal.vercel.app/) · [Backend API](https://ai-interview-coach-backend-nfu8.onrender.com) · [Report an Issue](../../issues)

</div>

---

## Overview

**AI Interview Coach** is a full-stack web application that helps candidates prepare for job interviews using generative AI. Users upload their resume and specify a target role; the system generates tailored interview questions, evaluates spoken or written answers in real time, and tracks performance across sessions.

The application was originally prototyped in **Google AI Studio** and has since been substantially re-engineered for production use: the codebase was restructured into an independent, deployable frontend/backend architecture, the UI was rebuilt to be fully mobile-responsive, and the application was deployed to a live, publicly accessible environment with automated uptime management.

### Live Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend (React SPA) | Vercel | https://ai-interview-coach-six-opal.vercel.app/ |
| Backend (REST API) | Render | https://ai-interview-coach-backend-nfu8.onrender.com |

> **Note:** The backend runs on Render's free tier, which suspends inactive services. A scheduled [cron-job.org](https://cron-job.org) health-check ping keeps the API warm and minimizes cold-start latency for end users.

---

## Key Features

- **Resume-Aware Question Generation** — Parses uploaded PDF resumes and generates role-specific behavioral and technical interview questions using the Gemini API.
- **Real-Time Answer Evaluation** — Each response is scored (1–10) with structured, constructive feedback, including strengths, areas for improvement, and a model sample answer.
- **Session History & Analytics** — All practice sessions are persisted and browsable, with average scores and timestamps for tracking progress over time.
- **Interview Preparation Guidance** — An in-app tips modal offers best practices for interview readiness.
- **Fully Responsive Interface** — Rebuilt from the original AI Studio prototype to work seamlessly across desktop, tablet, and mobile viewports.
- **Independent, Production-Ready Deployment** — Frontend and backend are decoupled, containerizable, and independently deployable services.

---

## Project Background

This project began as a prototype built in Google AI Studio. Since then, the following engineering work has been completed independently:

- **Restructured the codebase** from a single AI Studio export into a clean, separated `frontend/` and `backend/` project layout suitable for independent deployment and version control.
- **Rebuilt the UI for full mobile responsiveness**, ensuring usability across all screen sizes rather than the desktop-first prototype layout.
- **Decoupled the frontend and backend into independently deployable services**, rather than a single bundled server.
- **Deployed to production**: frontend on **Vercel**, backend on **Render**.
- **Configured a scheduled uptime ping via cron-job.org** to mitigate free-tier backend cold starts.
- **Hardened CORS, environment configuration, and API error handling** for a live, public-facing deployment.

---

## Architecture

### Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite (build tooling & dev server)
- Tailwind CSS (responsive styling)
- Lucide React (icon system)
- Motion (animations)

**Backend**
- Node.js (ES Modules) + Express.js
- Google Gemini API (question generation & answer scoring)
- PDF text extraction: `unpdf`, `pdf-parse` (with OCR fallback via Gemini for scanned documents)
- JSON file-based session persistence

**Infrastructure & DevOps**
- Vercel (frontend hosting & CI/CD)
- Render (backend hosting)
- cron-job.org (scheduled backend keep-alive)
- Git-based deployment pipelines on both platforms

### Project Structure

```
ai-interview-coach/
├── frontend/                     # React SPA (deployed to Vercel)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── SetupView.tsx         # Role input & resume upload
│   │   │   ├── InterviewView.tsx     # Live Q&A interface
│   │   │   ├── SummaryView.tsx       # Results & performance summary
│   │   │   ├── HistoryView.tsx       # Past session browser
│   │   │   └── PrepTipsModal.tsx     # Interview prep guidance
│   │   ├── data/
│   │   │   └── sampleResumes.ts      # Sample resume fixtures
│   │   ├── App.tsx                   # Application state & routing logic
│   │   ├── types.ts                  # Shared TypeScript interfaces
│   │   ├── index.css                 # Global styles (Tailwind entry)
│   │   ├── main.tsx                  # Entry point
│   │   └── vite-env.d.ts
│   ├── dist/                         # Production build output (generated)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Express REST API (deployed to Render)
│   ├── data/
│   │   └── history.json              # Session persistence store
│   ├── dist/                         # Compiled production output (generated)
│   ├── server.ts                     # API routes & business logic
│   └── package.json
│
├── .env.example                  # Environment variable template
├── .gitignore
├── LICENSE
├── metadata.json                 # AI Studio project metadata
└── README.md
```

---

## Application Flow

```
1. Setup
   User specifies a target role and uploads a resume (PDF)
        ↓
2. Question Generation
   Backend sends role + parsed resume text to Gemini
   → Returns 5 tailored behavioral & technical questions
        ↓
3. Interview
   User answers each question in turn
   Each answer is scored and critiqued in real time via Gemini
        ↓
4. Summary
   Aggregate score and feedback are computed and displayed
   Session is persisted to backend storage
        ↓
5. History
   User can review, revisit, or delete past sessions at any time
```

---

## API Reference

Base URL (production): `https://ai-interview-coach-backend-nfu8.onrender.com`

| Endpoint | Method | Description | Request Body |
|---|---|---|---|
| `/health` | GET | Health check (used for uptime monitoring) | — |
| `/api/parse-pdf` | POST | Extracts text from an uploaded resume PDF | `{ pdfBase64 }` |
| `/api/generate-questions` | POST | Generates tailored interview questions | `{ role, resume }` |
| `/api/score-answer` | POST | Scores and critiques a candidate's answer | `{ question, type, answer, role }` |
| `/api/save-session` | POST | Persists a completed interview session | `{ role, resumeSnippet, avgScore, results }` |
| `/api/history` | GET | Retrieves all saved sessions | — |
| `/api/history/:id` | DELETE | Deletes a specific session | — |
| `/api/history` | DELETE | Clears all session history | — |

#### Example — Generate Questions

**Response**
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about a time you optimized a React component's performance.",
      "type": "behavioral",
      "focus": "React optimization",
      "hint": "Discuss specific techniques such as memoization or lazy loading."
    }
  ]
}
```

#### Example — Score Answer

**Response**
```json
{
  "score": 8,
  "feedback": "Strong, structured answer with specific examples.",
  "strengths": ["Clear structure", "Technical depth"],
  "improvements": ["Could mention testing strategy"],
  "sampleAnswer": "A concise, high-scoring example response..."
}
```

---

## Getting Started Locally

### Prerequisites

- Node.js 18+
- npm 8+
- A [Google Gemini API key](https://ai.google.dev/)

### Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd ai-interview-coach

# 2. Install backend dependencies
cd backend
npm install
cp .env.example .env      # add your GEMINI_API_KEY

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

**Backend (`backend/.env`)**
```env
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
PORT=3000
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:3000
```

### Run in Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # http://localhost:3000

# Terminal 2 — Frontend
cd frontend
npm run dev         # http://localhost:5173
```

---

## Deployment

This project is deployed as two independent services rather than a single bundled server, which allows each layer to scale, redeploy, and fail independently.

### Frontend — Vercel

- Framework preset: **Vite**
- Root directory: `frontend`
- Environment variable: `VITE_API_URL` → set to the Render backend URL
- Automatic deployments are triggered on every push to the main branch

### Backend — Render

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment variables: `GEMINI_API_KEY`, `FRONTEND_URL` (must exactly match the deployed frontend origin, without a trailing slash)
- Health check path: `/health`

### Uptime Management — cron-job.org

Render's free tier suspends services after a period of inactivity, introducing cold-start delays. A scheduled job on [cron-job.org](https://cron-job.org) pings the backend's `/health` endpoint at regular intervals to keep the service warm and reduce latency for real users.

---

## Interview Scoring Criteria

Each answer is evaluated by Gemini across the following dimensions, producing a single 1–10 composite score:

- **Clarity** — structure and articulation of the response
- **Relevance** — how directly the answer addresses the question
- **Depth** — technical or behavioral specificity
- **Examples** — use of concrete, real-world illustrations
- **Growth Mindset** — evidence of reflection and learning

---

## Security & Privacy

- Resume content is transmitted only to the Gemini API for question generation and is not shared with any third party.
- Session data is persisted server-side in JSON storage on the backend host.
- API keys are managed exclusively via environment variables and are never committed to version control.
- CORS is restricted to the deployed frontend origin.

---

## Troubleshooting

**The app is slow to respond on first load**
Render's free tier suspends the backend after inactivity. The first request after idle time may take up to a minute to receive a cold-start response; subsequent requests are fast.

**`GEMINI_API_KEY is missing` error**
Confirm the key is set correctly in the backend's environment variables on Render (or `.env` locally), and redeploy/restart the service.

**CORS errors in the browser console**
Verify that `FRONTEND_URL` on the backend exactly matches the deployed frontend URL, including protocol and excluding any trailing slash.

**PDF parsing fails**
Ensure the uploaded file is a valid, text-based PDF resume under 10MB. Scanned or image-based PDFs are supported via an OCR fallback but may take slightly longer to process.

---

## Roadmap

- [ ] Persistent database storage (replacing JSON file storage)
- [ ] User authentication and per-user session history
- [ ] Voice-based answer input
- [ ] Export session results as PDF

---

## License

This project is distributed under the MIT License. See `LICENSE` for details.

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

<div align="center">

**[Live Demo](https://ai-interview-coach-six-opal.vercel.app/)** · Built with Google Gemini AI, React, and Express

</div>
