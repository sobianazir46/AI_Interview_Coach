import React, { useState, useRef } from "react";
import { POPULAR_ROLES, SAMPLE_RESUMES } from "../data/sampleResumes";
import {
  FileText,
  Upload,
  Briefcase,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileType,
  Wand2,
  BookOpen,
} from "lucide-react";

interface SetupViewProps {
  role: string;
  setRole: (role: string) => void;
  resumeText: string;
  setResumeText: (text: string) => void;
  onStartInterview: () => void;
  isLoading: boolean;
  error: string;
  setError: (err: string) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  role,
  setRole,
  resumeText,
  setResumeText,
  onStartInterview,
  isLoading,
  error,
  setError,
}) => {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("upload");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle PDF file upload
  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setError("Please upload a valid PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("PDF file size must be under 10MB.");
      return;
    }

    setIsParsingPdf(true);
    setError("");
    setPdfFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          const res = await fetch("/api/parse-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pdfBase64: base64 }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to parse PDF file.");
          }

          setResumeText(data.text);
        } catch (err: any) {
          setError(err.message || "Could not read PDF. Please copy and paste resume text.");
        } finally {
          setIsParsingPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError("Failed to process file.");
      setIsParsingPdf(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (sampleId: string) => {
    const sample = SAMPLE_RESUMES.find((s) => s.id === sampleId);
    if (sample) {
      setRole(sample.role);
      setResumeText(sample.text);
      setPdfFileName(null);
      setError("");
    }
  };

  return (
    <div className="w-full min-h-screen py-4 sm:py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
      {/* Intro Banner */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4">
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          AI-Powered Interview
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
          Prepare for Your Dream Role
        </h1>
        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto px-2">
          Upload your resume and target role. Get AI-tailored questions & instant feedback.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-4 sm:p-8 space-y-4 sm:space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">{error}</div>
          </div>
        )}

        {/* Step 1: Target Job Role */}
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm font-bold text-slate-900">
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              1. Target Job Role
            </span>
            <span className="text-xs font-normal text-slate-500">Required</span>
          </label>

          <input
            type="text"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setError("");
            }}
            placeholder="e.g. Full Stack Developer, Data Scientist, Product Manager..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all"
          />

          {/* Quick Preset Buttons */}
          <div className="pt-1">
            <p className="text-xs text-slate-500 font-medium mb-2">Or select a popular target role:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setError("");
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    role === r
                      ? "bg-blue-600 border-blue-600 text-white font-semibold"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Resume Ingestion */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FileText className="w-4 h-4 text-blue-600" />
              2. Candidate Resume
            </label>

            {/* Quick Sample Resume Loader */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 hidden sm:inline">Try sample resume:</span>
              {SAMPLE_RESUMES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => loadSample(s.id)}
                  className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium border border-indigo-200/60 transition-colors"
                >
                  {s.title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs header */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "upload"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload PDF Resume
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "paste"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileType className="w-4 h-4" />
              Paste Resume Text
            </button>
          </div>

          {/* Tab Content: Upload PDF */}
          {activeTab === "upload" && (
            <div className="space-y-3 pt-2">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-300 hover:border-blue-500 hover:bg-slate-50/80"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePdfUpload(e.target.files[0]);
                    }
                  }}
                />

                {isParsingPdf ? (
                  <div className="flex flex-col items-center justify-center py-3 space-y-2">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm font-semibold text-slate-700">Extracting resume text from PDF...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Drop your PDF resume here, or <span className="text-blue-600 underline">browse files</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Supports PDF documents up to 10MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status or preview */}
              {pdfFileName && resumeText && !isParsingPdf && (
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-emerald-800">
                    <p className="font-semibold text-sm text-emerald-900">
                      Uploaded & Parsed: {pdfFileName}
                    </p>
                    <p className="mt-1 text-slate-600 line-clamp-2 italic">
                      "{resumeText.substring(0, 180)}..."
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Paste Text */}
          {activeTab === "paste" && (
            <div className="space-y-2 pt-2">
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setError("");
                }}
                rows={8}
                placeholder="Paste the full text of your resume here (work history, technical skills, projects, education)..."
                className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                <span>
                  {resumeText ? `${resumeText.trim().split(/\s+/).length} words` : "0 words"}
                </span>
                <span>Minimum ~50 words recommended for accurate questions</span>
              </div>
            </div>
          )}
        </div>

        {/* Start Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading || isParsingPdf}
            onClick={() => {
              if (!role.trim()) {
                setError("Please select or enter a target job role.");
                return;
              }
              if (!resumeText.trim()) {
                setError("Please upload a PDF resume or paste resume text.");
                return;
              }
              onStartInterview();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 text-base disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Gemini is generating 5 tailored questions...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate 5 Tailored Questions & Start Interview</span>
              </>
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
