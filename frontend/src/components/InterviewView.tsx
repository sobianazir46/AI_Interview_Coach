import React, { useState, useEffect, useRef } from "react";
import { Question, EvaluationResult } from "../types";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
  ChevronRight,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  Star,
  Award,
} from "lucide-react";

interface InterviewViewProps {
  role: string;
  questions: Question[];
  currentStep: number;
  results: EvaluationResult[];
  onSubmitAnswer: (answer: string) => Promise<EvaluationResult | null>;
  onProceedNext: () => void;
  isLoading: boolean;
  error: string;
  setError: (err: string) => void;
}

export const InterviewView: React.FC<InterviewViewProps> = ({
  role,
  questions,
  currentStep,
  results,
  onSubmitAnswer,
  onProceedNext,
  isLoading,
  error,
  setError,
}) => {
  const currentQuestion = questions[currentStep];
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [currentEval, setCurrentEval] = useState<EvaluationResult | null>(null);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);

  // Audio Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Answer timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reset answer & state when question step changes
  useEffect(() => {
    setUserAnswer("");
    setCurrentEval(null);
    setShowHint(false);
    setShowSampleAnswer(false);
    setElapsedSeconds(0);
    setError("");

    // Check if we already have an evaluation for this step (e.g. going back)
    if (results[currentStep]) {
      setUserAnswer(results[currentStep].answer);
      setCurrentEval(results[currentStep]);
    }
  }, [currentStep]);

  // Timer interval
  useEffect(() => {
    if (currentEval) return; // Stop timer once evaluated
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, currentEval]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Text-to-speech for reading question
  const handleToggleSpeakQuestion = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice dictation using Speech Recognition
  const handleToggleDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition / voice dictation is not supported in this browser engine.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setUserAnswer((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      setError("Please type or speak your response before submitting.");
      return;
    }
    setError("");
    const evalData = await onSubmitAnswer(userAnswer.trim());
    if (evalData) {
      setCurrentEval(evalData);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500 text-white border-emerald-600";
    if (score >= 6) return "bg-amber-500 text-white border-amber-600";
    return "bg-rose-500 text-white border-rose-600";
  };

  const getScoreBadgeText = (score: number) => {
    if (score >= 9) return "Outstanding";
    if (score >= 8) return "Strong Answer";
    if (score >= 6) return "Good Effort";
    if (score >= 4) return "Needs Revision";
    return "Off Topic";
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header bar: Progress & Role */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Mock Interview Session
            </span>
            <h2 className="text-xl font-bold text-white">{role}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Time: {formatTimer(elapsedSeconds)}</span>
            </div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
              Question {currentStep + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Badges & Text-to-Speech */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                currentQuestion?.type === "technical"
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  : "bg-purple-100 text-purple-700 border border-purple-200"
              }`}
            >
              {currentQuestion?.type || "Behavioral"}
            </span>
            <span className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
              Focus: {currentQuestion?.focus}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleSpeakQuestion}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              isSpeaking
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Listen to Question</span>
              </>
            )}
          </button>
        </div>

        {/* Question Heading */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            "{currentQuestion?.question}"
          </h3>
        </div>

        {/* Collapsible Hint */}
        {currentQuestion?.hint && (
          <div>
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? "Hide Answer Strategy Hint" : "Need a Hint / Structure Tip?"}</span>
            </button>
            {showHint && (
              <div className="mt-2 bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 text-xs text-blue-900 animate-fade-in leading-relaxed">
                <p className="font-semibold text-blue-950 mb-0.5">Answer Guidance:</p>
                {currentQuestion.hint}
              </div>
            )}
          </div>
        )}

        {/* Answer Text Box Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Your Response
            </label>

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={handleToggleDictation}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all ${
                isListening
                  ? "bg-red-500 text-white border-red-600 animate-pulse"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Recording (Click to stop)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-slate-600" />
                  <span>Voice Dictation</span>
                </>
              )}
            </button>
          </div>

          <textarea
            value={userAnswer}
            disabled={!!currentEval || isLoading}
            onChange={(e) => {
              setUserAnswer(e.target.value);
              setError("");
            }}
            rows={6}
            placeholder="Structure your response clearly. For behavioral questions, use Situation, Task, Action, Result. For technical questions, explain trade-offs..."
            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm leading-relaxed disabled:opacity-80"
          />

          <div className="flex justify-between items-center text-xs text-slate-500 px-1">
            <span>
              {userAnswer.trim() ? `${userAnswer.trim().split(/\s+/).length} words` : "0 words"}
            </span>
            <span>Focus on specific details and clear outcomes</span>
          </div>
        </div>

        {/* Submit or Proceed Actions */}
        {!currentEval ? (
          <button
            type="button"
            disabled={isLoading || !userAnswer.trim()}
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating answer with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Answer for AI Scoring & Feedback</span>
              </>
            )}
          </button>
        ) : (
          /* Instant Evaluation Card Display */
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-5 sm:p-6 space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-extrabold text-lg shadow-sm border ${getScoreColor(
                    currentEval.score
                  )}`}
                >
                  <span>{currentEval.score}</span>
                  <span className="text-[9px] uppercase font-bold opacity-80">/ 10</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    Score: {currentEval.score}/10 — {getScoreBadgeText(currentEval.score)}
                  </h4>
                  <p className="text-xs text-slate-500">Evaluated by Gemini AI Coach</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentEval(null)}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revise Answer</span>
              </button>
            </div>

            {/* Specific Constructive Feedback */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Constructive Feedback
              </h5>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                "{currentEval.feedback}"
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {currentEval.strengths && currentEval.strengths.length > 0 && (
                <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-3">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
                  </span>
                  <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside">
                    {currentEval.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentEval.improvements && currentEval.improvements.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-3">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Focus for Improvement
                  </span>
                  <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside">
                    {currentEval.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sample Exemplar Answer Toggle */}
            {currentEval.sampleAnswer && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>
                    {showSampleAnswer ? "Hide Exemplar Answer" : "View Top-Tier Sample Response"}
                  </span>
                </button>

                {showSampleAnswer && (
                  <div className="mt-2 bg-indigo-50/60 border border-indigo-200/60 rounded-xl p-3.5 text-xs text-indigo-950 leading-relaxed">
                    <p className="font-bold text-indigo-900 mb-1">Example High-Scoring Response:</p>
                    <p className="italic">"{currentEval.sampleAnswer}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Next Question CTA */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onProceedNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
              >
                <span>
                  {currentStep < questions.length - 1
                    ? "Proceed to Next Question"
                    : "Finish Interview & See Full Report"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
