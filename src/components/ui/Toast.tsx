"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const reducedMotion = useReducedMotion();

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "bg-success text-white",
    error: "bg-overdue text-white",
    info: "bg-graphite text-white",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 md:bottom-6 md:right-6">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-elevated",
                  colors[toast.type]
                )}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="text-body-sm font-medium">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-2 p-0.5 rounded hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
