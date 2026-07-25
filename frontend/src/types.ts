export interface Question {
  id: string;
  question: string;
  type: "behavioral" | "technical" | string;
  focus: string;
  hint: string;
}

export interface EvaluationResult {
  question: string;
  type: string;
  answer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  resumeSnippet?: string;
  timestamp: string;
  avgScore: number;
  results: EvaluationResult[];
}

export type AppView = "setup" | "interview" | "summary" | "history";
