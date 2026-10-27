"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { ExtractedTask, TaskType } from "@/lib/types";
import { taskTypes } from "@/lib/data";

interface EditExtractedTaskModalProps {
  task: ExtractedTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<ExtractedTask>) => void;
}

export function EditExtractedTaskModal({
  task,
  isOpen,
  onClose,
  onSave,
}: EditExtractedTaskModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState<TaskType>("assignment");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setSubject(task.subject);
      setType(task.type);
      setDueDate(task.dueDate ? format(task.dueDate, "yyyy-MM-dd") : "");
      setDueTime(task.dueTime || "");
      setDescription(task.description || "");
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<ExtractedTask> = {
      title: title.trim(),
      subject: subject.trim() || "General",
      type,
      dueDate: dueDate ? new Date(dueDate + "T23:59:59") : null,
      dueTime: dueTime || undefined,
      description: description.trim() || undefined,
      needsReview: false,
      reviewReason: undefined,
    };

    onSave(updates);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Extracted Task" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          id="title"
          label="Task Title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="subject"
            label="Subject/Course"
            placeholder="e.g., CS 201"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <Select
            id="type"
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
            options={taskTypes}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="dueDate"
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Input
            id="dueTime"
            label="Due Time (optional)"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>

        <Textarea
          id="description"
          label="Description (optional)"
          placeholder="Add any notes or details"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <p className="text-micro text-muted">
          Editing this task will clear any review warnings. Make sure the details are correct.
        </p>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
