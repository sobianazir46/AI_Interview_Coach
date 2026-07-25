import React, { useState, useEffect } from "react";
import { AppView, Question, EvaluationResult, InterviewSession } from "./types";
import { Header } from "./components/Header";
import { SetupView } from "./components/SetupView";
import { InterviewView } from "./components/InterviewView";
import { SummaryView } from "./components/SummaryView";
import { HistoryView } from "./components/HistoryView";
import { PrepTipsModal } from "./components/PrepTipsModal";

export default function App() {
  const [currentView, setView] = useState<AppView>("setup");

  // Input state
  const [role, setRole] = useState("");
  const [resumeText, setResumeText] = useState("");

  // Interview active session state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<EvaluationResult[]>([]);

  // Historical sessions & active inspected session
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTipsOpen, setIsTipsOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data || []);
      }
    } catch (err) {
      console.error("Failed to load interview history:", err);
    }
  };

  // 1. Start Mock Interview
  const handleStartInterview = async () => {
    setIsLoading(true);
    setError("");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role.trim(),
          resume: resumeText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate interview questions.");
      }

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Invalid questions array returned from server.");
      }

      setQuestions(data.questions);
      setResults([]);
      setCurrentStep(0);
      setActiveSession(null);
      setView("interview");
    } catch (err: any) {
      setError(err.message || "Failed to connect to AI Coach. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Answer for Scoring
  const handleSubmitAnswer = async (answer: string): Promise<EvaluationResult | null> => {
    setIsLoading(true);
    setError("");

    const currentQ = questions[currentStep];

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/score-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQ.question,
          type: currentQ.type,
          answer,
          role,
        }),
      });

      const evalData = await res.json();
      if (!res.ok) {
        throw new Error(evalData.error || "Failed to evaluate answer.");
      }

      const newResult: EvaluationResult = {
        question: currentQ.question,
        type: currentQ.type,
        answer,
        score: Number(evalData.score) || 5,
        feedback: evalData.feedback || "Good effort.",
        strengths: evalData.strengths || [],
        improvements: evalData.improvements || [],
        sampleAnswer: evalData.sampleAnswer || "",
      };

      // Update results list
      const updatedResults = [...results];
      updatedResults[currentStep] = newResult;
      setResults(updatedResults);

      return newResult;
    } catch (err: any) {
      setError(err.message || "Error scoring answer. Please try again.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Proceed to Next Question or Finish Session
  const handleProceedNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev: number) => prev + 1);
    } else {
      // Completed all 5 questions! Calculate final average score and save
      const totalScore = results.reduce((acc: number, curr: EvaluationResult | null) => acc + (curr ? curr.score : 0), 0);
      const avgScore = Number((totalScore / questions.length).toFixed(1));

      const newSessionPayload = {
        role,
        resumeSnippet: resumeText.substring(0, 200),
        avgScore,
        results,
      };

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiUrl}/api/save-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSessionPayload),
        });

        const data = await res.json();
        if (data.session) {
          setActiveSession(data.session);
        } else {
          setActiveSession({
            id: "temp_" + Date.now(),
            role,
            timestamp: new Date().toISOString(),
            avgScore,
            results,
          });
        }
      } catch (err) {
        setActiveSession({
          id: "temp_" + Date.now(),
          role,
          timestamp: new Date().toISOString(),
          avgScore,
          results,
        });
      } finally {
        await fetchHistory();
        setView("summary");
      }
    }
  };

  // Reset interview to start new session
  const handleResetInterview = () => {
    setRole("");
    setResumeText("");
    setQuestions([]);
    setResults([]);
    setCurrentStep(0);
    setActiveSession(null);
    setError("");
    setView("setup");
  };

  // Delete session from history
  const handleDeleteSession = async (id: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Clear all history
  const handleClearHistory = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/history`, { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Header
        currentView={currentView}
        setView={setView}
        historyCount={history.length}
        onOpenTips={() => setIsTipsOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {currentView === "setup" && (
          <SetupView
            role={role}
            setRole={setRole}
            resumeText={resumeText}
            setResumeText={setResumeText}
            onStartInterview={handleStartInterview}
            isLoading={isLoading}
            error={error}
            setError={setError}
          />
        )}

        {currentView === "interview" && questions.length > 0 && (
          <InterviewView
            role={role}
            questions={questions}
            currentStep={currentStep}
            results={results}
            onSubmitAnswer={handleSubmitAnswer}
            onProceedNext={handleProceedNext}
            isLoading={isLoading}
            error={error}
            setError={setError}
          />
        )}

        {currentView === "summary" && (
          <SummaryView
            session={
              activeSession || {
                id: "current",
                role,
                timestamp: new Date().toISOString(),
                avgScore: Number(
                  (
                    results.reduce((acc, curr) => acc + (curr ? curr.score : 0), 0) /
                    (questions.length || 1)
                  ).toFixed(1)
                ),
                results,
              }
            }
            setView={setView}
            onResetInterview={handleResetInterview}
          />
        )}

        {currentView === "history" && (
          <HistoryView
            history={history}
            onSelectSession={(session) => {
              setActiveSession(session);
              setView("summary");
            }}
            onDeleteSession={handleDeleteSession}
            onClearHistory={handleClearHistory}
            setView={setView}
          />
        )}
      </main>

      {/* Prep Tips Modal */}
      <PrepTipsModal isOpen={isTipsOpen} onClose={() => setIsTipsOpen(false)} />
    </div>
  );
}
