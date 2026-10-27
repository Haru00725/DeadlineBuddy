"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, HelpCircle, Pencil, Quote, AlertTriangle, FileText } from "lucide-react";
import { ExtractedTask } from "@/lib/types";
import { cn, formatDueDate, getTaskTypeLabel, getTaskTypeColor } from "@/lib/utils";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EditExtractedTaskModal } from "./EditExtractedTaskModal";

interface ExtractionResultsProps {
  tasks: ExtractedTask[];
  warning?: string | null;
  onUpdateTask: (id: string, updates: Partial<ExtractedTask>) => void;
  onAddSelected: () => void;
  onRescan: () => void;
}

export function ExtractionResults({
  tasks,
  warning,
  onUpdateTask,
  onAddSelected,
  onRescan,
}: ExtractionResultsProps) {
  const reducedMotion = useReducedMotion();
  const selectedCount = tasks.filter((t) => t.selected).length;
  const [editingTask, setEditingTask] = useState<ExtractedTask | null>(null);

  const getConfidenceInfo = (confidence: ExtractedTask["confidence"], needsReview: boolean) => {
    if (needsReview) {
      return {
        icon: AlertCircle,
        label: "Needs review",
        color: "text-warning",
        bg: "bg-warning-bg",
      };
    }
    switch (confidence) {
      case "high":
        return {
          icon: CheckCircle2,
          label: "High confidence",
          color: "text-success",
          bg: "bg-success-bg",
        };
      case "medium":
        return {
          icon: HelpCircle,
          label: "Medium confidence",
          color: "text-muted",
          bg: "bg-off-white",
        };
      case "low":
        return {
          icon: AlertCircle,
          label: "Low confidence",
          color: "text-warning",
          bg: "bg-warning-bg",
        };
    }
  };

  const handleEditSave = (updates: Partial<ExtractedTask>) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, updates);
      setEditingTask(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-warning-bg flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-warning" />
        </div>
        <h3 className="font-display font-semibold text-heading text-graphite mb-2">
          No Tasks Found
        </h3>
        <p className="text-body-sm text-muted max-w-md mx-auto mb-6">
          {warning || "We couldn't find any deadlines or tasks in this document. Try uploading a different notice or paste the text directly."}
        </p>
        <Button onClick={onRescan}>
          Try Another Document
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-lime-muted rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-graphite flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-body text-graphite">
            Scan complete — {tasks.length} item{tasks.length !== 1 ? "s" : ""} found
          </p>
          <p className="text-body-sm text-muted mt-0.5">
            Review the extracted tasks below. Edit or deselect any items before adding them.
          </p>
        </div>
      </div>

      {warning && (
        <div className="bg-warning-bg rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-body-sm text-graphite">{warning}</p>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task, index) => {
            const confidenceInfo = getConfidenceInfo(task.confidence, task.needsReview);
            const ConfidenceIcon = confidenceInfo.icon;

            return (
              <motion.div
                key={task.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.2, delay: index * 0.06 }
                }
                className={cn(
                  "relative p-4 bg-surface rounded-xl border transition-all",
                  task.selected
                    ? "border-lime shadow-card"
                    : "border-border hover:border-border-strong"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <Checkbox
                      checked={task.selected}
                      onChange={(checked) =>
                        onUpdateTask(task.id, { selected: checked })
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-body text-graphite">
                        {task.title}
                      </h3>
                      <div
                        className={cn(
                          "flex items-center gap-1 px-2 py-0.5 rounded-md text-micro flex-shrink-0",
                          confidenceInfo.bg,
                          confidenceInfo.color
                        )}
                      >
                        <ConfidenceIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">{confidenceInfo.label}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-body-sm text-muted mb-3">
                      <span className="font-medium">{task.subject}</span>
                      <span className="text-border-strong">·</span>
                      <Badge size="sm" className={getTaskTypeColor(task.type)}>
                        {getTaskTypeLabel(task.type)}
                      </Badge>
                      <span className="text-border-strong">·</span>
                      {task.dueDate ? (
                        <span className={task.needsReview ? "text-warning" : ""}>
                          {formatDueDate(task.dueDate)}
                          {task.dueTime && ` at ${task.dueTime}`}
                        </span>
                      ) : (
                        <span className="text-warning">No date specified</span>
                      )}
                    </div>

                    {task.reviewReason && (
                      <div className="flex items-center gap-2 text-micro text-warning mb-3">
                        <AlertTriangle className="w-3 h-3" />
                        {task.reviewReason}
                      </div>
                    )}

                    {task.description && (
                      <p className="text-body-sm text-muted mb-3">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-start gap-2 p-2.5 bg-off-white/50 rounded-lg">
                      <Quote className="w-3.5 h-3.5 text-muted flex-shrink-0 mt-0.5" />
                      <p className="text-body-sm text-muted italic line-clamp-2">
                        &quot;{task.sourceExcerpt}&quot;
                      </p>
                    </div>

                    {task.sourceFilename && (
                      <div className="flex items-center gap-1.5 mt-2 text-micro text-muted">
                        <FileText className="w-3 h-3" />
                        {task.sourceFilename}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-2 rounded-lg text-muted hover:text-graphite hover:bg-black/5 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
        <button
          onClick={onRescan}
          className="text-body-sm text-muted hover:text-graphite transition-colors"
        >
          Scan another notice
        </button>

        <div className="flex items-center gap-3">
          <span className="text-body-sm text-muted">
            {selectedCount} of {tasks.length} selected
          </span>
          <Button onClick={onAddSelected} disabled={selectedCount === 0}>
            Add Selected Tasks
          </Button>
        </div>
      </div>

      <EditExtractedTaskModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleEditSave}
      />
    </div>
  );
}
