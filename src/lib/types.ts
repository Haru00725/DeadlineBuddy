export type TaskType = "assignment" | "exam" | "project" | "quiz" | "presentation" | "registration" | "payment" | "reading" | "other";
export type Priority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  title: string;
  subject: string;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  dueDate: Date | null;
  dueTime?: string;
  description?: string;
  progress?: number;
  createdAt: Date;
  completedAt?: Date;
  sourceExcerpt?: string;
  sourceFilename?: string;
  confidence?: "high" | "medium" | "low";
}

export interface SerializedTask {
  id: string;
  title: string;
  subject: string;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  dueTime?: string;
  description?: string;
  progress?: number;
  createdAt: string;
  completedAt?: string;
  sourceExcerpt?: string;
  sourceFilename?: string;
  confidence?: "high" | "medium" | "low";
}

export interface ExtractedTask {
  id: string;
  title: string;
  subject: string;
  type: TaskType;
  dueDate: Date | null;
  dueTime?: string;
  description?: string;
  sourceExcerpt: string;
  sourceFilename?: string;
  confidence: "high" | "medium" | "low";
  selected: boolean;
  needsReview: boolean;
  reviewReason?: string;
}

export interface ScanRequest {
  file?: File;
  text?: string;
  filename?: string;
}

export interface ScanResponse {
  success: boolean;
  tasks?: ExtractedTask[];
  error?: string;
  warning?: string;
}

export interface DashboardStats {
  dueToday: number;
  upcoming: number;
  overdue: number;
  completed: number;
  weeklyProgress: number;
}

export type FilterType = "all" | "today" | "upcoming" | "overdue" | "completed";

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}
