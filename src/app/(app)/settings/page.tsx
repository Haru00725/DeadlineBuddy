"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Bell,
  Download,
  Upload,
  Trash2,
  Shield,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useTaskStore } from "@/lib/store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [notifications, setNotifications] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { tasks, exportTasks, importTasks, clearAllTasks } = useTaskStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const handleExportJSON = () => {
    if (tasks.length === 0) {
      showToast("No tasks to export", "info");
      return;
    }
    exportTasks("json");
    showToast(`Exported ${tasks.length} tasks`);
  };

  const handleExportICS = () => {
    const tasksWithDates = tasks.filter((t) => t.dueDate !== null);
    if (tasksWithDates.length === 0) {
      showToast("No tasks with dates to export", "info");
      return;
    }
    exportTasks("ics");
    showToast(`Exported ${tasksWithDates.length} tasks to calendar`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = importTasks(text);

      if (success) {
        showToast("Tasks imported successfully");
      } else {
        showToast("Invalid file format", "error");
      }
    } catch {
      showToast("Failed to read file", "error");
    }

    e.target.value = "";
  };

  const handleClearData = () => {
    clearAllTasks();
    setShowClearConfirm(false);
    showToast("All data cleared");
  };

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className={isMobile ? "px-4 py-6" : ""}>
      <motion.header
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="font-display font-bold text-display-sm text-graphite">
          Settings
        </h1>
        <p className="text-body-sm text-muted mt-1">
          Customize your DeadlineBuddy experience
        </p>
      </motion.header>

      <div className="space-y-4">
        <motion.section
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.1 }}
          className="bg-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-off-white flex items-center justify-center">
              <Palette className="w-5 h-5 text-muted" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-heading text-graphite">
                Appearance
              </h2>
              <p className="text-body-sm text-muted">
                Customize how DeadlineBuddy looks
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-graphite mb-2 block">
                Theme
              </label>
              <div className="flex gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border transition-all",
                        theme === option.value
                          ? "bg-lime border-lime text-graphite"
                          : "bg-off-white border-border text-muted hover:border-border-strong"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-body-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-micro text-muted mt-2">
                Dark mode coming soon. Currently only light mode is available.
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-body font-medium text-graphite">Compact mode</p>
                <p className="text-body-sm text-muted">
                  Show more tasks with smaller spacing
                </p>
              </div>
              <button
                onClick={() => setCompactMode(!compactMode)}
                className={cn(
                  "relative w-12 h-7 rounded-full transition-colors",
                  compactMode ? "bg-lime" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
                    compactMode ? "left-6" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.15 }}
          className="bg-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-off-white flex items-center justify-center">
              <Download className="w-5 h-5 text-muted" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-heading text-graphite">
                Data
              </h2>
              <p className="text-body-sm text-muted">
                Export, import, or clear your data ({tasks.length} tasks)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start" onClick={handleExportJSON}>
              <Download className="w-4 h-4" />
              Export Tasks (JSON)
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={handleExportICS}>
              <Calendar className="w-4 h-4" />
              Export to Calendar (ICS)
            </Button>
            <Button variant="secondary" className="w-full justify-start" onClick={handleImportClick}>
              <Upload className="w-4 h-4" />
              Import Tasks (JSON)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="ghost"
              className="w-full justify-start text-overdue hover:bg-overdue-bg"
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </motion.section>

        <motion.section
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.2 }}
          className="bg-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-off-white flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-muted" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-heading text-graphite">
                Install App
              </h2>
              <p className="text-body-sm text-muted">
                Add DeadlineBuddy to your home screen
              </p>
            </div>
          </div>

          <div className="p-4 bg-off-white rounded-xl">
            <p className="text-body-sm text-graphite mb-2">
              <strong>On Android:</strong> Tap the menu button in Chrome, then
              &quot;Install app&quot; or &quot;Add to Home screen&quot;
            </p>
            <p className="text-body-sm text-graphite">
              <strong>On iOS:</strong> Tap the share button in Safari, then &quot;Add to
              Home Screen&quot;
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.25 }}
          className="bg-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-off-white flex items-center justify-center">
              <Shield className="w-5 h-5 text-muted" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-heading text-graphite">
                Privacy
              </h2>
              <p className="text-body-sm text-muted">
                How your data is handled
              </p>
            </div>
          </div>

          <div className="space-y-2 text-body-sm text-muted">
            <p>
              DeadlineBuddy stores all your tasks locally in your browser using localStorage.
              Tasks are never sent to our servers.
            </p>
            <p>
              When you use the Scan Notice feature, your uploaded documents are processed
              securely using AI to extract deadlines. Documents are never stored after processing.
            </p>
          </div>
        </motion.section>

        <motion.footer
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.3 }}
          className="text-center py-6 text-body-sm text-muted"
        >
          <p>DeadlineBuddy v1.0.0</p>
          <p className="mt-1">Your deadlines, under control.</p>
        </motion.footer>
      </div>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Data"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-overdue-bg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-overdue" />
            </div>
            <div>
              <p className="font-medium text-graphite">
                This will permanently delete all {tasks.length} tasks.
              </p>
              <p className="text-body-sm text-muted">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleClearData}
            >
              Clear All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
