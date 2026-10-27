"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, Calendar, CheckCircle2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScanAnimationProps {
  onComplete: () => void;
}

const stages = [
  { icon: FileText, label: "Reading your notice", duration: 1500 },
  { icon: Search, label: "Finding assignments and exams", duration: 2000 },
  { icon: Calendar, label: "Extracting important dates", duration: 1500 },
  { icon: CheckCircle2, label: "Organizing your deadlines", duration: 1000 },
];

export function ScanAnimation({ onComplete }: ScanAnimationProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (currentStage < stages.length) {
      const timer = setTimeout(() => {
        if (currentStage === stages.length - 1) {
          setProgress(100);
          setTimeout(onComplete, 500);
        } else {
          setCurrentStage((s) => s + 1);
          setProgress(((currentStage + 1) / stages.length) * 100);
        }
      }, stages[currentStage].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStage, onComplete]);

  const CurrentIcon = stages[currentStage]?.icon || CheckCircle2;

  return (
    <div className="flex flex-col items-center py-12">
      <div className="relative mb-8">
        <motion.div
          className="w-40 h-52 bg-surface rounded-xl border border-border shadow-card overflow-hidden"
          initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="h-2 rounded bg-off-white"
                style={{ width: `${60 + Math.random() * 40}%` }}
                initial={reducedMotion ? {} : { opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
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
              className="absolute left-0 right-0 h-0.5 bg-lime"
              initial={{ top: 0 }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
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
          <CurrentIcon className="w-6 h-6 text-graphite" />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="text-center mb-6"
        >
          <h3 className="font-display font-semibold text-heading text-graphite mb-1">
            {stages[currentStage]?.label || "Complete!"}
          </h3>
          <p className="text-body-sm text-muted">
            This is a demo scan — no real AI processing
          </p>
        </motion.div>
      </AnimatePresence>

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

      <div className="flex items-center gap-2 mt-6">
        {stages.map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i <= currentStage ? "bg-lime" : "bg-border"
            }`}
            initial={reducedMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}
