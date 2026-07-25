import React from "react";
import { X, CheckCircle2, Lightbulb, Sparkles, BookOpen, Target, Award } from "lucide-react";

interface PrepTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrepTipsModal: React.FC<PrepTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Interview Mastery Tips</h2>
            <p className="text-xs text-slate-500">How to score 9+ on Gemini AI interview evaluations</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          {/* Tip 1: STAR Framework */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              1. The STAR Method for Behavioral Questions
            </h3>
            <p className="text-xs text-slate-600">
              When asked "Tell me about a time when...", structure your response using these 4 steps:
            </p>
            <ul className="text-xs space-y-1 text-slate-800 list-disc list-inside">
              <li><strong>Situation:</strong> Briefly set the scene (project, team size, timeline).</li>
              <li><strong>Task:</strong> State the specific responsibility or problem you needed to solve.</li>
              <li><strong>Action:</strong> Describe <em>your specific contributions</em> and tools used.</li>
              <li><strong>Result:</strong> Quantify the final outcome (e.g. reduced load times by 30%).</li>
            </ul>
          </div>

          {/* Tip 2: Technical Structure */}
          <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-indigo-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              2. Technical & System Design Answers
            </h3>
            <p className="text-xs text-indigo-900">
              Don't just give a binary definition. Explain trade-offs, edge cases, and practical real-world experience:
            </p>
            <ul className="text-xs space-y-1 text-indigo-900 list-disc list-inside">
              <li>Clarify assumptions before diving into implementation.</li>
              <li>Mention alternative approaches and why you selected your approach.</li>
              <li>Discuss performance, scalability, security, and error recovery.</li>
            </ul>
          </div>

          {/* Tip 3: Voice & Delivery */}
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-emerald-950 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              3. Voice Dictation & Clarity
            </h3>
            <p className="text-xs text-emerald-900">
              Use our built-in <strong>Voice Dictation</strong> button to practice speaking out loud. Speaking your answers aloud builds muscle memory and verbal confidence!
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Got it, Let's Practice!
          </button>
        </div>
      </div>
    </div>
  );
};
