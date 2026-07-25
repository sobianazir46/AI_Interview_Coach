# AI Interview Coach

<div align="center">
<img width="1200" height="475" alt="AI Interview Coach Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

> **Personalized job interview prep powered by Google Gemini AI**
>
> Generate role-tailored interview questions from your resume, get instant AI-driven feedback on your answers, and track your interview performance over time.

## 🎯 Overview

**AI Interview Coach** is a full-stack web application that helps candidates prepare for job interviews using advanced AI. The system analyzes your resume and job role, generates targeted interview questions, scores your answers with constructive feedback, and maintains a history of all your practice sessions.

### Key Features

- 📄 **Smart Resume Parsing**: Upload and parse PDF resumes to extract relevant experience
- 🤖 **AI-Powered Question Generation**: Gemini generates role-specific behavioral and technical questions
- 🎤 **Real-time Answer Evaluation**: Get instant scores (1-10) and detailed feedback on your responses
- 💡 **Actionable Insights**: Receive strengths, improvement areas, and sample answers for every question
- 📊 **Session History**: Track all practice sessions with performance metrics and timestamps
- 🎨 **Modern UI**: Responsive, intuitive interface built with React and Tailwind CSS

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 (UI framework)
- TypeScript (type safety)
- Vite (build tool & dev server)
- Tailwind CSS (styling)
- Lucide React (icons)
- Motion (animations)

**Backend:**
- Express.js (REST API server)
- Node.js ES Modules (server runtime)
- Google Gemini AI API (question generation & scoring)
- PDF Processing: unpdf, pdf-parse, pdf2json, pdf-lib (resume extraction)

**Infrastructure:**
- npm workspaces (monorepo structure)
- File-based persistence (JSON storage for sessions)
- Environment variables (.env.local configuration)

### Project Structure

```
ai-interview-coach/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/         # React UI components
│   │   │   ├── Header.tsx
│   │   │   ├── SetupView.tsx    # Interview setup & resume upload
│   │   │   ├── InterviewView.tsx # Interview Q&A interface
│   │   │   ├── SummaryView.tsx  # Results & performance summary
│   │   │   ├── HistoryView.tsx  # Past session history
│   │   │   └── PrepTipsModal.tsx # Interview prep tips
│   │   ├── App.tsx              # Main application state & logic
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── index.css            # Global styles
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── backend/                     # Express REST API
│   ├── server.ts                # API endpoints & business logic
│   ├── data/
│   │   └── history.json         # Session persistence store
│   ├── package.json
│   └── dist/                    # Production bundle (generated)
│
├── package.json                 # Workspace root manifest
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore patterns
└── README.md                    # This file
```

---

## 🔄 Data Flow & Pipelines

### Interview Session Flow

```
1. Setup Phase
   ├── User enters job role (e.g., "Senior React Engineer")
   ├── User uploads resume (PDF)
   └── Resume parsed for context
        ↓
2. Question Generation
   ├── Frontend sends role + resume to /api/generate-questions
   ├── Backend calls Gemini API with structured prompt
   └── Returns 5 tailored questions (behavioral + technical)
        ↓
3. Interview Phase
   ├── User answers question 1-5
   ├── Frontend sends each answer to /api/score-answer
   ├── Backend evaluates with Gemini (score 1-10 + feedback)
   └── Results displayed with strengths, improvements, sample answers
        ↓
4. Summary Phase
   ├── Calculate average score across all questions
   ├── Display performance metrics & feedback summary
   ├── Frontend sends session data to /api/save-session
   └── Session persisted to backend/data/history.json
        ↓
5. History View
   ├── User can browse all past sessions
   ├── View detailed results from previous interviews
   └── Delete sessions as needed
```

### API Endpoints

| Endpoint | Method | Purpose | Payload |
|----------|--------|---------|---------|
| `/api/generate-questions` | POST | Generate interview questions | `{ role, resume }` |
| `/api/score-answer` | POST | Evaluate user answer | `{ question, type, answer, role }` |
| `/api/save-session` | POST | Save interview session | `{ role, resumeSnippet, avgScore, results }` |
| `/api/history` | GET | Fetch all sessions | - |
| `/api/history/:id` | DELETE | Remove a session | - |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ ([download](https://nodejs.org/))
- **npm** 8+ (comes with Node.js)
- **Google Gemini API Key** ([get key](https://ai.google.dev/))

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This installs dependencies for both frontend and backend via npm workspaces.

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development servers**

   **Option A: Run both frontend & backend together**
   ```bash
   npm run dev:backend
   npm run dev:frontend
   # In separate terminals
   ```

   **Option B: Run backend and frontend separately**
   ```bash
   # Terminal 1: Backend (Express API)
   cd backend
   npm run dev
   # Runs on http://localhost:3000

   # Terminal 2: Frontend (React app)
   cd frontend
   npm run dev
   # Runs on http://localhost:5173 (or next available port)
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173` (frontend dev server)
   - The app will connect to `http://localhost:3000` (backend API)

---

## 📦 Building for Production

### Build both frontend and backend

```bash
npm run build
```

This command:
1. Builds React frontend with Vite → `frontend/dist/`
2. Bundles backend with esbuild → `dist/server.js`

### Start production server

```bash
npm run start
```

The backend will:
- Serve the frontend static files from `frontend/dist/`
- Run API routes on port 3000
- Persist sessions to `backend/data/history.json`

---

## 🛠️ Development Scripts

### Root Workspace

```bash
npm run dev:backend       # Start backend dev server (tsx)
npm run dev:frontend      # Start frontend dev server (vite)
npm run dev               # Start backend only
npm run build:backend     # Build backend for production
npm run build:frontend    # Build frontend for production
npm run build             # Build both (frontend then backend)
npm run start             # Run production backend
npm run preview           # Preview frontend production build
npm run lint              # Run TypeScript check on frontend
npm run clean             # Remove all dist directories
```

### Frontend Only (`cd frontend/`)

```bash
npm run dev               # Vite dev server with HMR
npm run build             # Production build
npm run preview           # Preview production build locally
npm run lint              # TypeScript type checking
```

### Backend Only (`cd backend/`)

```bash
npm run dev               # tsx watch mode (live reload)
npm run build             # esbuild production bundle
npm run start             # Run compiled dist/server.js
```

---

## 📋 Component Overview

### Frontend Components

- **Header.tsx**: Navigation and branding
- **SetupView.tsx**: Role input and PDF resume upload interface
- **InterviewView.tsx**: Q&A interface with real-time feedback
- **SummaryView.tsx**: Session results, average score, and performance analysis
- **HistoryView.tsx**: Browse, filter, and delete past interview sessions
- **PrepTipsModal.tsx**: Interview preparation tips and best practices

### State Management

The app uses React's `useState` and `useEffect` hooks for state management:
- Interview flow state (current question, results)
- Session history (loaded from backend)
- Loading/error states
- Modal visibility states

---

## 🔐 Security & Privacy

- Resume text is sent to Gemini API for question generation only
- Session data is stored locally in `backend/data/history.json`
- `.env.local` containing API keys is git-ignored (see `.gitignore`)
- No third-party analytics or tracking
- API communication uses standard HTTP/JSON

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY is missing"
- Ensure `.env.local` exists in the root directory
- Verify your API key is correctly set
- Restart both frontend and backend

### "Cannot connect to backend"
- Verify backend is running on `http://localhost:3000`
- Check terminal for backend error messages
- Ensure port 3000 is not in use by another process

### "Resume parsing failed"
- Ensure PDF is valid and readable
- File size must be under 10MB
- Try a different PDF file

### Port already in use
- Frontend tries ports 5173+ if occupied
- Backend occupies port 3000
- Kill process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)

---

## 📚 API Response Examples

### Generate Questions
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about a time you optimized React component performance.",
      "type": "behavioral",
      "focus": "React optimization",
      "hint": "Discuss specific techniques like memoization, lazy loading."
    }
  ]
}
```

### Score Answer
```json
{
  "score": 8,
  "feedback": "Great answer with specific examples...",
  "strengths": ["Clear structure", "Technical depth"],
  "improvements": ["Could mention testing"],
  "sampleAnswer": "Here's a concise example..."
}
```

---

## 🎓 Interview Scoring Criteria

Answers are scored 1-10 across these dimensions:
- **Clarity**: How well the answer is structured and articulated
- **Relevance**: How directly the answer addresses the question
- **Depth**: Technical or behavioral specificity
- **Examples**: Real-world or concrete illustrations
- **Growth Mindset**: Evidence of learning from experience

---

## 🚢 Deployment

The app can be deployed to any platform supporting Node.js:

- **Vercel** (frontend only, backend API required)
- **Heroku** (full-stack)
- **AWS** (EC2, Lambda, or similar)
- **Google Cloud Run** (containerized)
- **DigitalOcean** (App Platform)

For deployment:
1. Build the app: `npm run build`
2. Set `GEMINI_API_KEY` as an environment variable on your platform
3. Run: `npm run start` (or point to `dist/server.js`)

---

## 📝 License

This project is built with Google AI Studio. See LICENSE for details.

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or feedback:
- Open a GitHub Issue
- Check existing issues for similar problems
- Review the Troubleshooting section above

---

**Built with ❤️ using Google Gemini AI**
