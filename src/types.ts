/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  color: string; // hex
  members: string[]; // userIds
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string; // YYYY-MM-DD
  labels: string[];
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: string; // ISO string
}
