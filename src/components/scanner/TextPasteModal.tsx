"use client";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";

interface TextPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export function TextPasteModal({ isOpen, onClose, onSubmit }: TextPasteModalProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paste Notice Text" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Textarea
          id="noticeText"
          label="Notice content"
          placeholder="Paste your course notice, syllabus text, or assignment details here..."
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />

        <p className="text-body-sm text-muted">
          The scanner will attempt to extract deadlines, assignments, and exams from your text.
          This is a demo — actual AI extraction would happen in production.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!text.trim()}>
            Scan Text
          </Button>
        </div>
      </form>
    </Modal>
  );
}
