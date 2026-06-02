/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Task, Comment, TaskStatus, TaskPriority } from '../types';
import { USERS, loadState, saveState } from '../data';

interface AppContextType {
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  closeToast: () => void;
  addTask: (task: {
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
    labels: string[];
  }) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, authorId: string, text: string) => void;
  addProject: (name: string, color: string, members: string[]) => Project;
  updateProject: (id: string, name: string, color: string, members: string[]) => void;
  moveTask: (taskId: string, targetStatus: TaskStatus) => void;
  reorderProjects: (startIndex: number, endIndex: number) => void;
  registerUser: (name: string, role: string, color: string) => User;
  logoutUser: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const cached = localStorage.getItem('taskflow_users');
      return cached ? JSON.parse(cached) : USERS;
    } catch {
      return USERS;
    }
  });

  const [currentUser, setCurrentUserInternal] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('taskflow_current_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [state, setState] = useState(() => loadState());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserInternal(user);
    if (user) {
      localStorage.setItem('taskflow_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('taskflow_current_user');
    }
  };

  const registerUser = (name: string, role: string, color: string) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .slice(0, 3)
      .join('')
      .toUpperCase() || 'UN';

    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      initials,
      color,
      role
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('taskflow_users', JSON.stringify(updatedUsers));
    
    // Auto login
    setCurrentUser(newUser);
    showToast(`Welcome to TaskFlow, ${name}! Your account was registered.`, 'success');
    return newUser;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showToast('Logged out successfully', 'info');
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const cached = localStorage.getItem('taskflow_theme');
      if (cached === 'light' || cached === 'dark') return cached;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('taskflow_theme', theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Save state on any change
  useEffect(() => {
    saveState(state.projects, state.tasks, state.comments);
  }, [state]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => setToast(null);

  const addTask = (taskInput: {
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
    labels: string[];
  }) => {
    const newTask: Task = {
      ...taskInput,
      id: `t_${Date.now()}`,
      commentCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));

    showToast(`Task "${newTask.title.substring(0, 20)}${newTask.title.length > 20 ? '...' : ''}" created`, 'success');
    return newTask;
  };

  const updateTask = (updated: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updated.id ? updated : t)
    }));
  };

  const deleteTask = (taskId: string) => {
    setState(prev => {
      const taskToDelete = prev.tasks.find(t => t.id === taskId);
      const taskName = taskToDelete?.title || '';
      const updatedTasks = prev.tasks.filter(t => t.id !== taskId);
      const updatedComments = prev.comments.filter(c => c.taskId !== taskId);
      
      showToast(`Deleted task "${taskName.substring(0, 20)}"`, 'info');

      return {
        ...prev,
        tasks: updatedTasks,
        comments: updatedComments
      };
    });
  };

  const addComment = (taskId: string, authorId: string, text: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      taskId,
      authorId,
      text,
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      // Update comment count on task
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, commentCount: t.commentCount + 1 };
        }
        return t;
      });

      return {
        ...prev,
        comments: [...prev.comments, newComment],
        tasks: updatedTasks
      };
    });
  };

  const addProject = (name: string, color: string, members: string[]) => {
    const newProj: Project = {
      id: `p_${Date.now()}`,
      name,
      color,
      members: members.length === 0 ? [currentUser.id] : members,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setState(prev => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }));

    showToast(`Created project "${name}"`, 'success');
    return newProj;
  };

  const updateProject = (id: string, name: string, color: string, members: string[]) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, name, color, members } : p)
    }));
    showToast(`Updated project "${name}"`, 'success');
  };

  const moveTask = (taskId: string, targetStatus: TaskStatus) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;
      if (task.status === targetStatus) return prev;

      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: targetStatus };
        }
        return t;
      });

      return {
        ...prev,
        tasks: updatedTasks
      };
    });
  };

  const reorderProjects = (startIndex: number, endIndex: number) => {
    setState(prev => {
      const result = Array.from(prev.projects);
      if (startIndex < 0 || startIndex >= result.length || endIndex < 0 || endIndex >= result.length) {
        return prev;
      }
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return {
        ...prev,
        projects: result
      };
    });
  };

  return (
    <AppContext.Provider value={{
      users: users,
      projects: state.projects,
      tasks: state.tasks,
      comments: state.comments,
      currentUser,
      setCurrentUser,
      toast,
      showToast,
      closeToast,
      addTask,
      updateTask,
      deleteTask,
      addComment,
      addProject,
      updateProject,
      moveTask,
      reorderProjects,
      registerUser,
      logoutUser,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
