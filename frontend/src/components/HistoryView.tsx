import React, { useState } from "react";
import { InterviewSession, AppView } from "../types";
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ChevronRight,
  PlusCircle,
  Calendar,
  Award,
  X,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface HistoryViewProps {
  history: InterviewSession[];
  onSelectSession: (session: InterviewSession) => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  setView: (view: AppView) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectSession,
  onDeleteSession,
  onClearHistory,
  setView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSessionForModal, setSelectedSessionForModal] =
    useState<InterviewSession | null>(null);

  const filteredHistory = history.filter((s) =>
    s.role.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const getScoreBadge = (score: number) => {
    if (score >= 8) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 6) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  return (
    <div className="w-full min-h-screen py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-3 sm:pb-5">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 flex-shrink-0" />
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              History
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Review past interviews & feedback.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all past interview history?")) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setView("setup")}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Interview</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search history by role title..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Interview Sessions Saved</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You haven't completed any mock interviews yet. Start a session to generate questions, answer them, and receive AI scoring.
          </p>
          <button
            type="button"
            onClick={() => setView("setup")}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start First Mock Interview</span>
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500">
          No past sessions matching "{searchTerm}".
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1 min-w-[240px]">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900">{session.role}</h3>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${getScoreBadge(
                      session.avgScore
                    )}`}
                  >
                    Avg: {session.avgScore} / 10
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(session.timestamp).toLocaleDateString()} at{" "}
                    {new Date(session.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>•</span>
                  <span>{session.results.length} questions evaluated</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectSession(session)}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-blue-200 transition-colors"
                >
                  <span>Review Summary</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteSession(session.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};
