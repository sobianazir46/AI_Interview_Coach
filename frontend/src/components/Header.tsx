import React from "react";
import { AppView } from "../types";
import { Sparkles, History, PlusCircle, BookOpen, Award } from "lucide-react";

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  historyCount: number;
  onOpenTips: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setView,
  historyCount,
  onOpenTips,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4"> */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => setView("setup")}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group w-full sm:w-auto"
        >
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <Award className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors truncate">
                AI Coach
              </span>
              <span className="hidden xs:inline-flex items-center gap-0.5 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                <Sparkles className="w-2 sm:w-2.5 h-2 sm:h-2.5" />
                <span className="hidden sm:inline">Gemini</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block line-clamp-1">
              Personalized mock interviews
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-0">
          <button
            onClick={() => setView("setup")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === "setup"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Interview</span>
          </button>

          <button
            onClick={() => setView("history")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
              currentView === "history"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="bg-indigo-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenTips}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Interview Preparation Tips"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Prep Tips</span>
          </button>
        </div>
      </div>
    </header>
  );
};
