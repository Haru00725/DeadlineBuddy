"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, ArrowLeft, AlertCircle } from "lucide-react";
import { useTaskStore } from "@/lib/store";
import { ExtractedTask, Task } from "@/lib/types";
import { generateId, ensureDate } from "@/lib/utils";
import { UploadArea } from "@/components/scanner/UploadArea";
import { ScanningProgress } from "@/components/scanner/ScanningProgress";
import { ExtractionResults } from "@/components/scanner/ExtractionResults";
import { TextPasteModal } from "@/components/scanner/TextPasteModal";
import { useToast } from "@/components/ui/Toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { optimizeImageForScan } from "@/lib/imageOptimizer";

type ScanState = "upload" | "scanning" | "results" | "error";

interface ScanError {
  message: string;
  canRetry: boolean;
}

export default function ScanPage() {
  const [scanState, setScanState] = useState<ScanState>("upload");
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [scanError, setScanError] = useState<ScanError | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const { addTasks, checkDuplicate } = useTaskStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const performScan = useCallback(async (file?: File, text?: string) => {
    setScanState("scanning");
    setScanProgress(0);
    setScanStatus("Preparing document...");
    setScanError(null);
    setWarning(null);

    try {
      setScanProgress(20);
      setScanStatus("Preparing document...");

      const formData = new FormData();
      if (file) {
        const optimizedFile = await optimizeImageForScan(file);
        formData.append("file", optimizedFile);
        formData.append("filename", file.name);
      } else if (text) {
        formData.append("text", text);
      }

      setScanProgress(40);
      setScanStatus("Analyzing with AI...");

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      setScanProgress(70);
      setScanStatus("Extracting deadlines...");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scan document");
      }

      setScanProgress(90);
      setScanStatus("Processing results...");

      if (!data.success) {
        throw new Error(data.error || "Scan failed");
      }

      const tasks: ExtractedTask[] = (data.tasks || []).map((t: ExtractedTask) => ({
        ...t,
        id: t.id || generateId(),
        dueDate: ensureDate(t.dueDate),
      }));

      setScanProgress(100);
      setScanStatus("Complete!");

      setTimeout(() => {
        setExtractedTasks(tasks);
        setWarning(data.warning || null);
        setScanState("results");
      }, 500);

    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      const isConfigError = message.includes("not configured") || message.includes("API key");

      setScanError({
        message,
        canRetry: !isConfigError,
      });
      setScanState("error");
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    performScan(file);
  }, [performScan]);

  const handleTextSubmit = useCallback((text: string) => {
    setIsTextModalOpen(false);
    performScan(undefined, text);
  }, [performScan]);

  const handleUpdateTask = (id: string, updates: Partial<ExtractedTask>) => {
    setExtractedTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleAddSelected = () => {
    const selected = extractedTasks.filter((t) => t.selected);

    const tasksToAdd: Omit<Task, "id" | "createdAt" | "status">[] = [];
    let duplicateCount = 0;

    selected.forEach((extracted) => {
      const isDuplicate = checkDuplicate(extracted.title, extracted.dueDate);
      if (isDuplicate) {
        duplicateCount++;
        return;
      }

      tasksToAdd.push({
        title: extracted.title,
        subject: extracted.subject,
        type: extracted.type,
        priority: extracted.confidence === "high" ? "high" : "medium",
        dueDate: extracted.dueDate,
        dueTime: extracted.dueTime,
        description: extracted.description,
        sourceExcerpt: extracted.sourceExcerpt,
        sourceFilename: extracted.sourceFilename,
        confidence: extracted.confidence,
      });
    });

    if (tasksToAdd.length > 0) {
      addTasks(tasksToAdd);
    }

    let message = `${tasksToAdd.length} task${tasksToAdd.length !== 1 ? "s" : ""} added`;
    if (duplicateCount > 0) {
      message += `, ${duplicateCount} duplicate${duplicateCount !== 1 ? "s" : ""} skipped`;
    }

    showToast(message);
    handleRescan();
  };

  const handleRescan = () => {
    setScanState("upload");
    setExtractedTasks([]);
    setScanError(null);
    setWarning(null);
    setScanProgress(0);
  };

  return (
    <div className={isMobile ? "px-4 py-6" : ""}>
      <motion.header
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          {scanState !== "upload" && (
            <button
              onClick={handleRescan}
              className="p-2 -ml-2 rounded-lg text-muted hover:text-graphite hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-graphite" />
          </div>
          <div>
            <h1 className="font-display font-bold text-display-sm text-graphite">
              Scan Notice
            </h1>
            <p className="text-body-sm text-muted">
              Upload a college notice to extract deadlines
            </p>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
        className="bg-surface rounded-2xl border border-border p-4 sm:p-6"
      >
        <AnimatePresence mode="wait">
          {scanState === "upload" && (
            <motion.div
              key="upload"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <UploadArea
                onFileSelect={handleFileSelect}
                onTextPaste={() => setIsTextModalOpen(true)}
              />
              <p className="text-micro text-muted text-center mt-4">
                Your document will be processed securely using AI.
              </p>
            </motion.div>
          )}

          {scanState === "scanning" && (
            <motion.div
              key="scanning"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <ScanningProgress progress={scanProgress} status={scanStatus} />
            </motion.div>
          )}

          {scanState === "error" && scanError && (
            <motion.div
              key="error"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
              className="py-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-overdue-bg flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-overdue" />
              </div>
              <h3 className="font-display font-semibold text-heading text-graphite mb-2">
                Scan Failed
              </h3>
              <p className="text-body-sm text-muted max-w-md mx-auto mb-6">
                {scanError.message}
              </p>
              <div className="flex justify-center gap-3">
                {scanError.canRetry && (
                  <button
                    onClick={() => setScanState("upload")}
                    className="px-4 py-2 bg-lime text-graphite rounded-xl font-medium hover:bg-lime-hover transition-colors"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={handleRescan}
                  className="px-4 py-2 bg-off-white text-graphite rounded-xl font-medium hover:bg-border transition-colors"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}

          {scanState === "results" && (
            <motion.div
              key="results"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              <ExtractionResults
                tasks={extractedTasks}
                warning={warning}
                onUpdateTask={handleUpdateTask}
                onAddSelected={handleAddSelected}
                onRescan={handleRescan}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <TextPasteModal
        isOpen={isTextModalOpen}
        onClose={() => setIsTextModalOpen(false)}
        onSubmit={handleTextSubmit}
      />
    </div>
  );
}
