import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;
const PREFERRED_MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const EXTRACTION_PROMPT = `You are an expert at extracting academic deadlines and tasks from college notices, syllabi, announcements, and screenshots.

Extract ALL assignments, exams, quizzes, projects, presentations, registration deadlines, payment deadlines, and academic tasks.

CRITICAL RULES:
- Extract dates EXACTLY as stated.
- NEVER invent or guess dates.
- If a year is not specified, do NOT add one - leave it ambiguous.
- If a date is unclear, mark needsReview: true.
- Publication/issue/notice dates are NOT due dates.
- If no specific due date exists, set dueDate to null.

Return JSON in this format:
{
  "tasks": [
    {
      "title": "Clear task name",
      "subject": "Course code or subject if mentioned, otherwise General",
      "type": "assignment" | "exam" | "quiz" | "project" | "presentation" | "registration" | "payment" | "reading" | "other",
      "dueDate": "YYYY-MM-DD" or null,
      "dueTime": "HH:MM" or null,
      "description": "Brief description if available",
      "sourceExcerpt": "Exact text from document (max 200 chars)",
      "confidence": "high" | "medium" | "low",
      "needsReview": boolean,
      "reviewReason": "Reason if needsReview is true"
    }
  ],
  "documentSummary": "Brief 1-sentence summary of document"
}

If no tasks are found, return {"tasks": [], "documentSummary": "..."}`;

// Candidate models in order of priority and speed
const FALLBACK_MODELS = [
  PREFERRED_MODEL,
  "gemini-flash-lite-latest",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
];

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

async function generateWithFallback(
  genAI: GoogleGenerativeAI,
  contentParts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }>
) {
  // Deduplicate candidate models
  const uniqueModels = Array.from(new Set(FALLBACK_MODELS.filter(Boolean)));
  let lastError: unknown = null;

  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
        safetySettings: SAFETY_SETTINGS,
      });

      // Timeout of 18 seconds per attempt so hanging models do not freeze the UI
      const result = await Promise.race([
        model.generateContent(contentParts),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Model ${modelName} timed out`)), 18000)
        ),
      ]);

      return result.response.text();
    } catch (err) {
      console.warn(`Model ${modelName} attempt failed, trying fallback:`, (err as Error)?.message || err);
      lastError = err;
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: "AI scanning is not configured. Please add an API key to use this feature.",
        tasks: [],
      },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const filename = formData.get("filename") as string | null;

    if (!file && !text) {
      return NextResponse.json(
        { success: false, error: "No file or text provided" },
        { status: 400 }
      );
    }

    let contentParts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];
    let sourceFilename = filename || "pasted-text";

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Unsupported file type. Please upload PDF, JPG, PNG, or WebP." },
          { status: 400 }
        );
      }

      sourceFilename = file.name;
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      contentParts = [
        {
          inlineData: {
            mimeType: file.type,
            data: base64,
          },
        },
        { text: EXTRACTION_PROMPT },
      ];
    } else if (text) {
      if (text.length > 50000) {
        return NextResponse.json(
          { success: false, error: "Text too long. Maximum 50,000 characters." },
          { status: 400 }
        );
      }

      contentParts = [
        { text: `Document content:\n\n${text}\n\n${EXTRACTION_PROMPT}` },
      ];
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const responseText = await generateWithFallback(genAI, contentParts);

    let parsed;
    try {
      const cleanedText = responseText
        .replace(/```json\n?/gi, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json(
        { success: false, error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      return NextResponse.json(
        { success: false, error: "Invalid response format from AI." },
        { status: 500 }
      );
    }

    const validTypes = ["assignment", "exam", "quiz", "project", "presentation", "registration", "payment", "reading", "other"];

    const tasks = parsed.tasks.map((task: Record<string, unknown>, index: number) => {
      const rawType = String(task.type || "other").toLowerCase();
      const type = validTypes.includes(rawType) ? rawType : "other";

      let needsReview = Boolean(task.needsReview);
      let reviewReason = task.reviewReason as string | undefined;

      let dueDate = (task.dueDate || task.due_date) as string | null;
      if (dueDate && typeof dueDate === "string") {
        if (!dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          needsReview = true;
          reviewReason = reviewReason || "Date format unclear";
        }
      } else {
        dueDate = null;
      }

      const dueTime = (task.dueTime || task.due_time) as string | undefined;

      return {
        id: `extracted-${Date.now()}-${index}`,
        title: String(task.title || task.task || "Untitled Task"),
        subject: String(task.subject || "General"),
        type,
        dueDate,
        dueTime: dueTime || undefined,
        description: (task.description as string) || undefined,
        sourceExcerpt: String(task.sourceExcerpt || task.excerpt || "").slice(0, 200),
        sourceFilename,
        confidence: ["high", "medium", "low"].includes(task.confidence as string)
          ? task.confidence
          : "medium",
        needsReview,
        reviewReason,
        selected: !needsReview && task.confidence !== "low",
      };
    });

    return NextResponse.json({
      success: true,
      tasks,
      warning: tasks.length === 0
        ? "No tasks or deadlines found in this document."
        : undefined,
    });
  } catch (error) {
    console.error("Scan error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (errorMessage.includes("503") || errorMessage.includes("high demand")) {
      return NextResponse.json(
        { success: false, error: "AI service is temporarily experiencing high demand. Please try again shortly." },
        { status: 503 }
      );
    }

    if (errorMessage.includes("401") || errorMessage.includes("403")) {
      return NextResponse.json(
        { success: false, error: "API key invalid or expired. Please check configuration." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to process document. Please try again." },
      { status: 500 }
    );
  }
}
