import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Project, Task, Comment, TaskStatus, TaskPriority } from '../types';
import { api, setToken, clearToken, ApiComment } from '../lib/api';

interface AppContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  currentUser: User | null;
  isLoading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  closeToast: () => void;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string, role: string, color: string) => Promise<void>;
  logoutUser: () => void;
  addTask: (task: {
    projectId: string; title: string; description?: string; status: TaskStatus;
    priority: TaskPriority; assigneeId?: string; dueDate?: string; labels: string[];
  }) => Promise<void>;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, authorId: string, text: string) => Promise<void>;
  addProject: (name: string, color: string, members: string[]) => Promise<void>;
  updateProject: (id: string, name: string, color: string, members: string[]) => void;
  moveTask: (taskId: string, targetStatus: TaskStatus) => void;
  reorderProjects: (startIndex: number, endIndex: number) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapComment(c: ApiComment): Comment {
  return { id: c.id, taskId: c.taskId, authorId: c.author.id, text: c.text, createdAt: c.createdAt };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const cached = localStorage.getItem('taskflow_theme');
      if (cached === 'light' || cached === 'dark') return cached;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    try { localStorage.setItem('taskflow_theme', theme); } catch {}
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };
  const closeToast = () => setToast(null);

  // Load all app data after authentication
  const loadAppData = useCallback(async () => {
    const [usersRes, projectsRes, tasksRes, commentsRes] = await Promise.all([
      api.getUsers(),
      api.getProjects(),
      api.getTasks(),
      api.getAllComments(),
    ]);
    setUsers(usersRes.users);
    setProjects(projectsRes.projects as Project[]);
    setTasks(tasksRes.tasks as Task[]);
    setComments(commentsRes.comments.map(mapComment));
  }, []);

  // Restore session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const { user } = await api.me();
        setCurrentUser(user);
        await loadAppData();
      } catch {
        clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [loadAppData]);

  // ---- Auth ----

  const loginUser = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    setToken(token);
    setCurrentUser(user);
    await loadAppData();
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  const registerUser = async (name: string, email: string, password: string, role: string, color: string) => {
    const { token, user } = await api.register(name, email, password, role, color);
    setToken(token);
    setCurrentUser(user);
    await loadAppData();
    showToast(`Welcome to TaskFlow, ${user.name}!`, 'success');
  };

  const logoutUser = () => {
    clearToken();
    setCurrentUser(null);
    setUsers([]);
    setProjects([]);
    setTasks([]);
    setComments([]);
    showToast('Logged out successfully', 'info');
  };

  // ---- Tasks ----

  const addTask = async (input: {
    projectId: string; title: string; description?: string; status: TaskStatus;
    priority: TaskPriority; assigneeId?: string; dueDate?: string; labels: string[];
  }) => {
    const { task } = await api.createTask(input);
    setTasks(prev => [...prev, task as Task]);
    showToast(`Task "${task.title.substring(0, 20)}${task.title.length > 20 ? '…' : ''}" created`, 'success');
  };

  const updateTask = (updated: Task) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    api.updateTask(updated.id, {
      title: updated.title,
      description: updated.description,
      status: updated.status,
      priority: updated.priority,
      assigneeId: updated.assigneeId ?? null,
      dueDate: updated.dueDate ?? null,
      labels: updated.labels,
    }).catch(err => showToast(err.message, 'error'));
  };

  const deleteTask = (taskId: string) => {
    const taskName = tasks.find(t => t.id === taskId)?.title || '';
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setComments(prev => prev.filter(c => c.taskId !== taskId));
    showToast(`Deleted task "${taskName.substring(0, 20)}"`, 'info');
    api.deleteTask(taskId).catch(err => showToast(err.message, 'error'));
  };

  const moveTask = (taskId: string, targetStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
    api.moveTask(taskId, targetStatus).catch(err => showToast(err.message, 'error'));
  };

  // ---- Comments ----

  const addComment = async (taskId: string, _authorId: string, text: string) => {
    const { comment } = await api.createComment(taskId, text);
    setComments(prev => [...prev, mapComment(comment)]);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, commentCount: t.commentCount + 1 } : t));
  };

  // ---- Projects ----

  const addProject = async (name: string, color: string, members: string[]) => {
    const ids = members.length === 0 && currentUser ? [currentUser.id] : members;
    const { project } = await api.createProject(name, color, ids);
    setProjects(prev => [...prev, project as Project]);
    showToast(`Created project "${name}"`, 'success');
  };

  const updateProject = (id: string, name: string, color: string, members: string[]) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name, color, members } : p));
    showToast(`Updated project "${name}"`, 'success');
    api.updateProject(id, name, color, members).catch(err => showToast(err.message, 'error'));
  };

  const reorderProjects = (startIndex: number, endIndex: number) => {
    setProjects(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
    api.reorderProjects(startIndex, endIndex).catch(err => showToast(err.message, 'error'));
  };

  // Full-page loader during initial session restore
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1EFE8] dark:bg-[#121212]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-[#378ADD] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading TaskFlow…</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      users, projects, tasks, comments, currentUser, isLoading,
      toast, showToast, closeToast,
      loginUser, registerUser, logoutUser,
      addTask, updateTask, deleteTask, addComment,
      addProject, updateProject, moveTask, reorderProjects,
      theme, toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
