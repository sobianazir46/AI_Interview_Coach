import React, { useState } from "react";
import { InterviewSession, EvaluationResult, AppView } from "../types";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check,
  RotateCcw,
  History,
  Sparkles,
  BarChart3,
  Star,
  BookOpen,
} from "lucide-react";

interface SummaryViewProps {
  session: InterviewSession;
  setView: (view: AppView) => void;
  onResetInterview: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  session,
  setView,
  onResetInterview,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  const avgScore = Number(session.avgScore) || 0;

  // Behavioral vs Technical breakdown
  const behavioralResults = session.results.filter(
    (r) => r.type?.toLowerCase() === "behavioral"
  );
  const technicalResults = session.results.filter(
    (r) => r.type?.toLowerCase() === "technical"
  );

  const calcAvg = (arr: EvaluationResult[]) => {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, curr) => acc + curr.score, 0);
    return Number((sum / arr.length).toFixed(1));
  };

  const behavioralAvg = calcAvg(behavioralResults);
  const technicalAvg = calcAvg(technicalResults);

  const getVerdict = (score: number) => {
    if (score >= 8.5) return { label: "Ready for Top Tech Interviews", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (score >= 7.0) return { label: "Solid Competency Demonstrated", color: "text-blue-600 bg-blue-50 border-blue-200" };
    if (score >= 5.5) return { label: "Passable — Needs Polish", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { label: "Significant Preparation Needed", color: "text-rose-600 bg-rose-50 border-rose-200" };
  };

  const verdict = getVerdict(avgScore);

  const getScoreColorBadge = (score: number) => {
    if (score >= 8) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 6) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  const handleCopyReport = () => {
    let report = `# AI Interview Session Report\n`;
    report += `Role: ${session.role}\nDate: ${new Date(session.timestamp).toLocaleString()}\n`;
    report += `Overall Score: ${avgScore} / 10\n\n`;

    session.results.forEach((r, idx) => {
      report += `## Question ${idx + 1}: ${r.question}\n`;
      report += `- Category: ${r.type}\n`;
      report += `- Candidate Answer: "${r.answer}"\n`;
      report += `- Score: ${r.score}/10\n`;
      report += `- Feedback: ${r.feedback}\n\n`;
    });

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-1">
          <Award className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            Interview Session Complete
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            {session.role}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Completed on {new Date(session.timestamp).toLocaleDateString()} at{" "}
            {new Date(session.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Big Overall Score Gauge */}
        <div className="inline-flex flex-col items-center justify-center bg-slate-50 border border-slate-200/90 rounded-2xl p-6 min-w-[220px]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Overall Average Score
          </span>
          <div className="text-5xl font-black text-slate-900 tracking-tight">
            {avgScore} <span className="text-2xl text-slate-400 font-semibold">/ 10</span>
          </div>
          <div className={`mt-3 px-3.5 py-1 rounded-full text-xs font-bold border ${verdict.color}`}>
            {verdict.label}
          </div>
        </div>

        {/* Score Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <span className="text-xs text-slate-500 font-medium">Questions Answered</span>
            <p className="text-xl font-bold text-slate-900 mt-1">{session.results.length} / 5</p>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/70 rounded-xl p-4 text-center">
            <span className="text-xs text-purple-700 font-medium">Behavioral Avg</span>
            <p className="text-xl font-bold text-purple-950 mt-1">
              {behavioralResults.length > 0 ? `${behavioralAvg} / 10` : "N/A"}
            </p>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-xl p-4 text-center">
            <span className="text-xs text-indigo-700 font-medium">Technical Avg</span>
            <p className="text-xl font-bold text-indigo-950 mt-1">
              {technicalResults.length > 0 ? `${technicalAvg} / 10` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Questions Breakdown Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Detailed Q&A Evaluation</h2>
            <p className="text-xs text-slate-500">Review all 5 questions, scores, and specific AI feedback</p>
          </div>

          <button
            type="button"
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Markdown!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copy Session Summary</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {session.results.map((item, idx) => {
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50/50"
              >
                {/* Header item */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {item.question}
                      </p>
                      <span className="text-[11px] text-slate-500 capitalize">
                        {item.type || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${getScoreColorBadge(
                        item.score
                      )}`}
                    >
                      {item.score}/10
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-4 text-xs sm:text-sm">
                    {/* Full Question */}
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Interview Question
                      </span>
                      <p className="font-semibold text-slate-900 mt-0.5">{item.question}</p>
                    </div>

                    {/* Candidate Answer */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <span className="text-xs font-bold text-slate-600 block mb-1">
                        Your Submitted Answer:
                      </span>
                      <p className="text-slate-800 italic leading-relaxed">
                        "{item.answer}"
                      </p>
                    </div>

                    {/* AI Feedback */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        AI Feedback:
                      </span>
                      <p className="text-slate-800 leading-relaxed">{item.feedback}</p>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {item.strengths && item.strengths.length > 0 && (
                        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-3">
                          <span className="text-xs font-bold text-emerald-800 block mb-1">
                            Key Strengths:
                          </span>
                          <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside">
                            {item.strengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.improvements && item.improvements.length > 0 && (
                        <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-3">
                          <span className="text-xs font-bold text-amber-800 block mb-1">
                            Actionable Improvements:
                          </span>
                          <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside">
                            {item.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Sample answer */}
                    {item.sampleAnswer && (
                      <div className="bg-indigo-50/60 border border-indigo-200/60 rounded-xl p-3.5">
                        <span className="text-xs font-bold text-indigo-900 block mb-1 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-indigo-600" /> Exemplar Model Answer:
                        </span>
                        <p className="text-xs text-indigo-950 leading-relaxed italic">
                          "{item.sampleAnswer}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => setView("history")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors"
        >
          <History className="w-4 h-4 text-slate-600" />
          <span>View Session History</span>
        </button>

        <button
          type="button"
          onClick={onResetInterview}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start Another Interview</span>
        </button>
      </div>
    </div>
  );
};
