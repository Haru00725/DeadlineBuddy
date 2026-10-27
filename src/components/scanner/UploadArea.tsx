"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X, Image, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  onTextPaste: () => void;
}

export function UploadArea({ onFileSelect, onTextPaste }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const reducedMotion = useReducedMotion();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleScan = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return FileImage;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="preview"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
            className="relative p-6 bg-off-white rounded-2xl border border-border"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center">
                {React.createElement(getFileIcon(selectedFile), {
                  className: "w-6 h-6 text-muted",
                })}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-body text-graphite truncate">
                  {selectedFile.name}
                </p>
                <p className="text-body-sm text-muted">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 rounded-lg text-muted hover:text-overdue hover:bg-overdue-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleScan}>
                Scan Notice
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "relative p-12 rounded-2xl border-2 border-dashed transition-all duration-200",
              isDragging
                ? "border-lime bg-lime-muted scale-[1.01]"
                : "border-border bg-off-white/50 hover:border-muted"
            )}
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  isDragging ? "bg-lime" : "bg-surface border border-border"
                )}
              >
                <FileText
                  className={cn(
                    "w-7 h-7 transition-colors",
                    isDragging ? "text-graphite" : "text-muted"
                  )}
                />
              </motion.div>

              <h3 className="font-display font-semibold text-heading text-graphite mb-1">
                Drop your college notice here
              </h3>
              <p className="text-body-sm text-muted mb-4">
                Supports PDF, screenshots, and images
              </p>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-body-sm font-medium text-graphite hover:bg-off-white transition-colors">
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <button
          onClick={onTextPaste}
          className="text-body-sm text-muted hover:text-graphite transition-colors"
        >
          Or paste notice text instead
        </button>
      </div>
    </div>
  );
}

import React from "react";
