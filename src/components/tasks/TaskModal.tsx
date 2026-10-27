"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Task, TaskType, Priority } from "@/lib/types";
import { subjects, taskTypes, priorities } from "@/lib/data";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt" | "status" | "completedAt">) => void;
  editingTask?: Task | null;
}

export function TaskModal({ isOpen, onClose, onSave, editingTask }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(subjects[0]);
  const [type, setType] = useState<TaskType>("assignment");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setSubject(editingTask.subject);
      setType(editingTask.type);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ? format(editingTask.dueDate, "yyyy-MM-dd") : "");
      setDueTime(editingTask.dueTime || "");
      setDescription(editingTask.description || "");
    } else {
      setTitle("");
      setSubject(subjects[0]);
      setType("assignment");
      setPriority("medium");
      setDueDate("");
      setDueTime("");
      setDescription("");
    }
    setErrors({});
  }, [editingTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = "Title is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dueDateObj = dueDate ? new Date(dueDate + "T23:59:59") : null;

    onSave({
      title: title.trim(),
      subject,
      type,
      priority,
      dueDate: dueDateObj,
      dueTime: dueTime || undefined,
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? "Edit Task" : "New Task"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          id="title"
          label="Task Title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="subject"
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            options={subjects.map((s) => ({ value: s, label: s }))}
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
            label="Due Date (optional)"
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

        <Select
          id="priority"
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          options={priorities}
        />

        <Textarea
          id="description"
          label="Description (optional)"
          placeholder="Add any notes or details"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editingTask ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
