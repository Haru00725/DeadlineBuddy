import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const EXTRACTION_PROMPT = `You are an expert at extracting academic deadlines and tasks from college notices, syllabi, and announcements.

Analyze the provided document and extract ALL tasks, assignments, exams, quizzes, projects, presentations, registration deadlines, payment deadlines, and other academic obligations.

CRITICAL DATE RULES:
- Extract dates EXACTLY as stated in the document
- NEVER invent, guess, or assume dates
- If a year is not specified, DO NOT add one - leave it ambiguous
- If a date is unclear or could have multiple interpretations, mark needsReview: true
- Publication/issue dates are NOT due dates
- "Submit by", "due on", "deadline", "last date" indicate due dates
- If no specific date exists, set dueDate to null

For each task found, extract:
- title: Clear, concise task name
- subject: Course code/name if mentioned, otherwise "General"
- type: One of: assignment, exam, quiz, project, presentation, registration, payment, reading, other
- dueDate: ISO date string (YYYY-MM-DD) or null if not specified/unclear
- dueTime: Time in HH:MM format if specified, otherwise omit
- description: Brief instructions or details if provided
- sourceExcerpt: The exact text from the document that mentions this task (max 200 chars)
- confidence: "high" if date and task are clearly stated, "medium" if somewhat ambiguous, "low" if very uncertain
- needsReview: true if date is ambiguous, year is missing, or information conflicts
- reviewReason: If needsReview is true, explain why (e.g., "Year not specified", "Multiple possible dates")

Respond with a JSON object:
{
  "tasks": [
    {
      "title": "string",
      "subject": "string",
      "type": "string",
      "dueDate": "YYYY-MM-DD" | null,
      "dueTime": "HH:MM" | undefined,
      "description": "string" | undefined,
      "sourceExcerpt": "string",
      "confidence": "high" | "medium" | "low",
      "needsReview": boolean,
      "reviewReason": "string" | undefined
    }
  ],
  "documentSummary": "Brief summary of what this document is about"
}

If no tasks are found, return {"tasks": [], "documentSummary": "..."}
Only return valid JSON, no markdown code blocks.`;

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: "AI scanning is not configured. Please add GEMINI_API_KEY to use this feature.",
        tasks: []
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

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      safetySettings: [
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
      ],
    });

    const result = await model.generateContent(contentParts);
    const response = result.response;
    const responseText = response.text();

    let parsed;
    try {
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse Gemini response:", responseText);
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
      const type = validTypes.includes(task.type as string) ? task.type : "other";

      let needsReview = Boolean(task.needsReview);
      let reviewReason = task.reviewReason as string | undefined;

      if (task.dueDate && typeof task.dueDate === "string") {
        if (!task.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          needsReview = true;
          reviewReason = reviewReason || "Date format unclear";
        }
      }

      return {
        id: `extracted-${Date.now()}-${index}`,
        title: String(task.title || "Untitled Task"),
        subject: String(task.subject || "General"),
        type,
        dueDate: task.dueDate || null,
        dueTime: task.dueTime || undefined,
        description: task.description || undefined,
        sourceExcerpt: String(task.sourceExcerpt || "").slice(0, 200),
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
    console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (errorMessage.includes("503") || errorMessage.includes("high demand")) {
      return NextResponse.json(
        { success: false, error: "AI service is temporarily overloaded. Please try again in a few moments." },
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
