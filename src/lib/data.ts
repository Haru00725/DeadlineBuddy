import { TaskType, Priority } from "./types";

export const subjects = [
  "General",
  "CS 101",
  "CS 201",
  "MATH 101",
  "MATH 301",
  "ENG 101",
  "ENG 102",
  "CHEM 101",
  "CHEM 241",
  "HIST 101",
  "HIST 150",
  "BUS 101",
  "BUS 310",
  "PHYS 101",
  "PHYS 201",
  "PHIL 101",
  "BIO 101",
  "ECON 101",
  "PSYCH 101",
];

export const taskTypes: { value: TaskType; label: string }[] = [
  { value: "assignment", label: "Assignment" },
  { value: "exam", label: "Exam" },
  { value: "project", label: "Project" },
  { value: "quiz", label: "Quiz" },
  { value: "presentation", label: "Presentation" },
  { value: "registration", label: "Registration" },
  { value: "payment", label: "Payment" },
  { value: "reading", label: "Reading" },
  { value: "other", label: "Other" },
];

export const priorities: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];
