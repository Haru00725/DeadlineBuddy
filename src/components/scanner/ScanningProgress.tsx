"use client";

import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScanningProgressProps {
  progress: number;
  status: string;
}

export function ScanningProgress({ progress, status }: ScanningProgressProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center py-12">
      <div className="relative mb-8">
        <motion.div
          className="w-40 h-52 bg-off-white rounded-xl border border-border shadow-card overflow-hidden"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="h-2 rounded bg-border"
                style={{ width: `${60 + Math.random() * 40}%` }}
                animate={reducedMotion ? {} : { opacity: [0.3, 0.7, 0.3] }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {!reducedMotion && (
            <motion.div
              className="absolute left-0 right-0 h-1 bg-lime"
              style={{ top: `${progress}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-lime blur-sm" />
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="absolute -bottom-4 -right-4 w-12 h-12 rounded-xl bg-lime flex items-center justify-center shadow-card"
          initial={reducedMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 20 }}
        >
          <Loader2 className="w-6 h-6 text-graphite animate-spin" />
        </motion.div>
      </div>

      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-center mb-6"
      >
        <h3 className="font-display font-semibold text-heading text-graphite mb-1">
          {status}
        </h3>
        <p className="text-body-sm text-muted">
          Processing with Google Gemini AI
        </p>
      </motion.div>

      <div className="w-64">
        <div className="flex justify-between text-micro text-muted mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-off-white rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-lime rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
