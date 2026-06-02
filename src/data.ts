/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Project, Task, Comment } from './types';

export const USERS: User[] = [
  { id: "u1", name: "Alex Chen",    initials: "AC", color: "#378ADD", role: "PM" },
  { id: "u2", name: "Priya Sharma", initials: "PS", color: "#1D9E75", role: "Developer" },
  { id: "u3", name: "Jordan Lee",   initials: "JL", color: "#D4537E", role: "Designer" },
  { id: "u4", name: "Marco Rossi",  initials: "MR", color: "#BA7517", role: "Developer" },
  { id: "u5", name: "Sara Kim",     initials: "SK", color: "#533AB7", role: "QA" }
];

export const INITIAL_PROJECTS: Project[] = [
  { id: "p1", name: "Website Redesign", color: "#378ADD",
    members: ["u1","u2","u3"], createdAt: "2026-04-01" },
  { id: "p2", name: "Mobile App v2",    color: "#1D9E75",
    members: ["u1","u2","u4"], createdAt: "2026-04-15" },
  { id: "p3", name: "Q3 Marketing",     color: "#D4537E",
    members: ["u1","u3","u5"], createdAt: "2026-05-01" }
];

export const COLUMNS = ["todo", "in_progress", "in_review", "done"] as const;

export const INITIAL_TASKS: Task[] = [
  { id: "t1",  projectId: "p1", title: "Redesign homepage hero section",
    description: "Update copy, hero image, and CTA button styles.",
    status: "in_progress", priority: "high",   assigneeId: "u3",
    dueDate: "2026-06-10", labels: ["design","frontend"],
    commentCount: 3, createdAt: "2026-05-20" },

  { id: "t2",  projectId: "p1", title: "Accessibility audit (WCAG 2.1 AA)",
    description: "Run axe-core scan and fix all critical issues.",
    status: "todo",        priority: "urgent", assigneeId: "u2",
    dueDate: "2026-06-05", labels: ["a11y"],
    commentCount: 1, createdAt: "2026-05-22" },

  { id: "t3",  projectId: "p1", title: "Implement dark mode toggle",
    description: "Add a simple toggle switch for users to toggle light and dark themes manually.",
    status: "todo",        priority: "normal", assigneeId: "u2",
    dueDate: "2026-06-20", labels: ["frontend"],
    commentCount: 0, createdAt: "2026-05-23" },

  { id: "t4",  projectId: "p1", title: "Update brand color tokens",
    description: "Adjust all color values in variables file to align with the new corporate palette guidelines.",
    status: "in_review",   priority: "high",   assigneeId: "u3",
    dueDate: "2026-06-03", labels: ["design"],
    commentCount: 5, createdAt: "2026-05-15" },

  { id: "t5",  projectId: "p1", title: "Write component documentation",
    description: "Document all reusable UI widgets, input parameters, and utility style tokens.",
    status: "done",        priority: "low",    assigneeId: "u1",
    dueDate: "2026-05-30", labels: ["docs"],
    commentCount: 2, createdAt: "2026-05-10" },

  { id: "t6",  projectId: "p2", title: "Build onboarding flow screens",
    description: "Design and implement responsive wizard screens to guide first-time users.",
    status: "in_progress", priority: "urgent", assigneeId: "u3",
    dueDate: "2026-06-08", labels: ["design","mobile"],
    commentCount: 4, createdAt: "2026-05-18" },

  { id: "t7",  projectId: "p2", title: "Integrate push notifications",
    description: "Connect FCM tokens to backend notifications queue service.",
    status: "todo",        priority: "high",   assigneeId: "u4",
    dueDate: "2026-06-15", labels: ["backend","mobile"],
    commentCount: 0, createdAt: "2026-05-24" },

  { id: "t8",  projectId: "p3", title: "Draft Q3 email campaign copy",
    description: "Draft newsletter sequences for existing customers detailing product updates.",
    status: "in_progress", priority: "normal", assigneeId: "u1",
    dueDate: "2026-06-12", labels: ["copy"],
    commentCount: 2, createdAt: "2026-05-20" },

  { id: "t9",  projectId: "p3", title: "Design social media templates",
    description: "Create vector design banners for key media announcements in Instagram, Twitter formats.",
    status: "todo",        priority: "normal", assigneeId: "u3",
    dueDate: "2026-06-18", labels: ["design","social"],
    commentCount: 1, createdAt: "2026-05-25" },

  { id: "t10", projectId: "p2", title: "Fix login screen keyboard overlap",
    description: "Adjust input auto-scroll behavior when soft keyboards pop up on tiny devices.",
    status: "done",        priority: "high",   assigneeId: "u4",
    dueDate: "2026-05-28", labels: ["bug","mobile"],
    commentCount: 3, createdAt: "2026-05-14" }
];

export const INITIAL_COMMENTS: Comment[] = [
  { id: "c1", taskId: "t1", authorId: "u1",
    text: "Let's go with the full-bleed option for mobile.",
    createdAt: "2026-05-21T09:14:00Z" },
  { id: "c2", taskId: "t1", authorId: "u3",
    text: "Agreed. I'll have a mockup ready by EOD Thursday.",
    createdAt: "2026-05-21T10:32:00Z" },
  { id: "c3", taskId: "t1", authorId: "u2",
    text: "Make sure the CTA passes 4.5:1 contrast ratio.",
    createdAt: "2026-05-22T14:05:00Z" }
];

// LocalStorage helpers
const KEY_PROJECTS = 'taskflow_projects';
const KEY_TASKS = 'taskflow_tasks';
const KEY_COMMENTS = 'taskflow_comments';

export const loadState = () => {
  try {
    const cachedProj = localStorage.getItem(KEY_PROJECTS);
    const cachedTasks = localStorage.getItem(KEY_TASKS);
    const cachedComments = localStorage.getItem(KEY_COMMENTS);

    return {
      projects: cachedProj ? JSON.parse(cachedProj) as Project[] : INITIAL_PROJECTS,
      tasks: cachedTasks ? JSON.parse(cachedTasks) as Task[] : INITIAL_TASKS,
      comments: cachedComments ? JSON.parse(cachedComments) as Comment[] : INITIAL_COMMENTS
    };
  } catch (err) {
    console.error("Failed to load local state", err);
    return {
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS,
      comments: INITIAL_COMMENTS
    };
  }
};

export const saveState = (projects: Project[], tasks: Task[], comments: Comment[]) => {
  try {
    localStorage.setItem(KEY_PROJECTS, JSON.stringify(projects));
    localStorage.setItem(KEY_TASKS, JSON.stringify(tasks));
    localStorage.setItem(KEY_COMMENTS, JSON.stringify(comments));
  } catch (err) {
    console.error("Failed to save state to localStorage", err);
  }
};
