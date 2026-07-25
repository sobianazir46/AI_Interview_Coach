import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { extractText } from "unpdf";

const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS configuration - allow requests from Vercel frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

// Body parser with 10MB limit for resume uploads
app.use(express.json({ limit: "10mb" }));

// File persistence directory for sessions
const DATA_DIR = path.join(__dirname, "data");
const FRONTEND_DIR = path.join(__dirname, "../frontend");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), "utf-8");
}

function getSessionsFromDisk() {
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading history file:", err);
    return [];
  }
}

function saveSessionsToDisk(sessions: any[]) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing history file:", err);
  }
}

// Lazy initialization of Gemini AI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Routes

// 1. PDF Resume Parsing endpoint
async function extractTextFromPdfBuffer(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  // Primary Strategy: unpdf (modern PDF.js engine for Node.js)
  try {
    const uint8Array = new Uint8Array(buffer);
    const { text, totalPages } = await extractText(uint8Array);
    const fullText = Array.isArray(text) ? text.join("\n\n") : (text || "");
    const trimmed = fullText.trim();
    if (trimmed.length >= 10) {
      return { text: trimmed, numPages: totalPages || 1 };
    }
  } catch (e) {
    console.warn("unpdf extraction failed:", e);
  }

  // Fallback Strategy: pdf-parse
  try {
    if (pdfParseModule && pdfParseModule.PDFParse) {
      const parser = new pdfParseModule.PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        const t = result?.text ? result.text.trim() : "";
        if (t.length >= 10) {
          return { text: t, numPages: result?.total || 1 };
        }
      } finally {
        if (typeof parser.destroy === "function") {
          await parser.destroy().catch(() => {});
        }
      }
    }
  } catch (e) {
    console.warn("pdf-parse fallback failed:", e);
  }

  return { text: "", numPages: 1 };
}

app.post("/api/parse-pdf", async (req, res) => {
  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) {
      res.status(400).json({ error: "Missing PDF base64 content." });
      return;
    }

    // Safely extract pure base64 data regardless of data URL mime-type prefix
    let base64Data = pdfBase64;
    if (base64Data.includes(",")) {
      base64Data = base64Data.split(",")[1];
    }
    base64Data = base64Data.replace(/[\r\n\s]/g, "");

    const buffer = Buffer.from(base64Data, "base64");

    // 1. Try local PDF parser
    let { text: extractedText, numPages } = await extractTextFromPdfBuffer(buffer);

    // 2. If local parser extracted insufficient text (e.g. scanned/image PDF), use Gemini 3.6 Flash if available
    if ((!extractedText || extractedText.length < 15) && process.env.GEMINI_API_KEY) {
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
            "Extract and transcribe all text from this resume PDF document accurately. Include all work experience, dates, job titles, responsibilities, skills, education, and projects. Output only the clean extracted resume text.",
          ],
        });

        if (response.text && response.text.trim().length >= 10) {
          extractedText = response.text.trim();
        }
      } catch (geminiErr: any) {
        console.error("Gemini PDF OCR extraction error:", geminiErr);
      }
    }

    if (!extractedText || extractedText.length < 15) {
      const isApiKeyMissing = !process.env.GEMINI_API_KEY;
      const detailMsg = isApiKeyMissing
        ? "Could not parse text from this PDF with local parser. For scanned PDFs or complex formats, please set GEMINI_API_KEY in Settings, or copy and paste your resume text directly."
        : "Could not extract readable text from this PDF file. Please ensure it is a text-based resume PDF, or copy and paste your resume text directly.";
      res.status(422).json({ error: detailMsg });
      return;
    }

    res.json({ text: extractedText, numPages });
  } catch (error: any) {
    console.error("PDF Parsing endpoint error:", error);
    res.status(500).json({
      error: error.message || "Failed to process PDF resume file. Please copy and paste your resume text instead.",
    });
  }
});

// 2. Generate 5 Interview Questions endpoint
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { resume, role } = req.body;
    if (!role || !role.trim()) {
      res.status(400).json({ error: "Target job role is required." });
      return;
    }
    if (!resume || !resume.trim()) {
      res.status(400).json({ error: "Resume text or document is required." });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `You are a world-class senior technical recruiter and hiring manager conducting a realistic job interview.
    
Target Job Role: ${role}
Candidate Resume Content:
${resume}

Generate exactly 5 highly relevant, realistic interview questions tailored specifically to the candidate's resume and target role.
Include a balanced mixture of behavioral questions (past experiences, conflict resolution, leadership, communication) and technical questions (domain skills, system concepts, problem-solving).

Return a JSON array of 5 question objects matching the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You generate professional, tailored interview questions based on candidate resumes and job roles.",
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Array of exactly 5 interview questions",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique question id (q1, q2, q3, q4, q5)" },
              question: { type: Type.STRING, description: "The interview question text" },
              type: { type: Type.STRING, description: "'behavioral' or 'technical'" },
              focus: { type: Type.STRING, description: "Core competence tested, e.g., 'React State Management' or 'Conflict Resolution'" },
              hint: { type: Type.STRING, description: "Short tip for structuring a good answer (e.g., STAR method hint)" },
            },
            required: ["id", "question", "type", "focus", "hint"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received empty response from Gemini AI.");
    }

    const questions = JSON.parse(text);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Failed to parse valid question set.");
    }

    res.json({ questions });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    res.status(500).json({
      error: error.message || "Failed to generate interview questions. Please try again.",
    });
  }
});

// 3. Score Answer endpoint
app.post("/api/score-answer", async (req, res) => {
  try {
    const { question, type, answer, role } = req.body;
    if (!question || !answer) {
      res.status(400).json({ error: "Question and answer text are required." });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert interviewer scoring a candidate's response.
    
Target Job Role: ${role || "Candidate Role"}
Question Type: ${type || "general"}
Interview Question: "${question}"
Candidate Answer: "${answer}"

Evaluate the candidate's answer carefully.
Provide:
1. Score from 1 to 10 (integer), where 10 is outstanding and 1 is completely off-topic/poor.
2. Exactly 2-3 sentences of specific, constructive feedback highlighting what worked well and what could be improved.
3. 1-2 key strengths of the answer.
4. 1-2 concrete areas for improvement.
5. A brief sample model answer demonstrating a top-tier score.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You evaluate candidate interview answers constructively and fairly.",
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Numerical score from 1 to 10" },
            feedback: { type: Type.STRING, description: "2-3 sentences of constructive feedback" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key strengths observed in the response",
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable points to improve the answer",
            },
            sampleAnswer: { type: Type.STRING, description: "A high-scoring exemplar response" },
          },
          required: ["score", "feedback", "strengths", "improvements", "sampleAnswer"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Received empty response from Gemini AI.");
    }

    const evaluation = JSON.parse(text);
    res.json(evaluation);
  } catch (error: any) {
    console.error("Error scoring answer:", error);
    res.status(500).json({
      error: error.message || "Failed to score answer. Please try again.",
    });
  }
});

// 4. Save completed session endpoint
app.post("/api/save-session", (req, res) => {
  try {
    const sessionData = req.body;
    if (!sessionData || !sessionData.role || !sessionData.results) {
      res.status(400).json({ error: "Invalid session data." });
      return;
    }

    const sessions = getSessionsFromDisk();

    const newSession = {
      id: "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      role: sessionData.role,
      resumeSnippet: sessionData.resumeSnippet || "",
      timestamp: new Date().toISOString(),
      avgScore: Number(sessionData.avgScore) || 0,
      results: sessionData.results || [],
    };

    // Prepend new session (most recent first)
    sessions.unshift(newSession);
    saveSessionsToDisk(sessions);

    res.json({ success: true, session: newSession });
  } catch (error: any) {
    console.error("Error saving session:", error);
    res.status(500).json({ error: "Failed to save session history." });
  }
});

// 5. Get interview session history endpoint
app.get("/api/history", (req, res) => {
  try {
    const sessions = getSessionsFromDisk();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve interview history." });
  }
});

// 6. Delete session endpoint
app.delete("/api/history/:id", (req, res) => {
  try {
    const { id } = req.params;
    let sessions = getSessionsFromDisk();
    sessions = sessions.filter((s: any) => s.id !== id);
    saveSessionsToDisk(sessions);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete session." });
  }
});

// 7. Clear all history endpoint
app.delete("/api/history", (req, res) => {
  try {
    saveSessionsToDisk([]);
    res.json({ success: true, sessions: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear history." });
  }
});

// Vite Middleware & Static Server integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: FRONTEND_DIR,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(FRONTEND_DIR, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
