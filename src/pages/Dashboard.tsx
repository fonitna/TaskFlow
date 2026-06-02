/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { NavLink } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ListTodo, 
  ArrowRight, 
  Folder, 
  Plus, 
  Smile,
  Zap,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  onOpenTask: (id: string) => void;
  onOpenQuickAdd: (status: 'todo' | 'in_progress' | 'in_review' | 'done') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenTask, onOpenQuickAdd }) => {
  const { tasks, projects, users, currentUser } = useApp();

  // Tasks assigned to current active user
  const myTasks = React.useMemo(() => {
    return tasks.filter(t => t.assigneeId === currentUser.id);
  }, [tasks, currentUser.id]);

  // Statistics
  const stats = React.useMemo(() => {
    const total = myTasks.length;
    const todo = myTasks.filter(t => t.status === 'todo').length;
    const inProgress = myTasks.filter(t => t.status === 'in_progress').length;
    const inReview = myTasks.filter(t => t.status === 'in_review').length;
    const done = myTasks.filter(t => t.status === 'done').length;

    return { total, todo, inProgress, inReview, done };
  }, [myTasks]);

  // Overdue highlights: system clock is 2026-06-02
  const overdueTasks = React.useMemo(() => {
    const systemDateStr = '2026-06-02';
    return myTasks.filter(t => t.dueDate && t.status !== 'done' && t.dueDate < systemDateStr);
  }, [myTasks]);

  // Project progress details
  const projectStats = React.useMemo(() => {
    return projects.map(proj => {
      const projTasks = tasks.filter(t => t.projectId === proj.id);
      const doneCount = projTasks.filter(t => t.status === 'done').length;
      const progressPercent = projTasks.length > 0 ? Math.round((doneCount / projTasks.length) * 100) : 0;
      return {
        ...proj,
        totalTasks: projTasks.length,
        progress: progressPercent
      };
    });
  }, [projects, tasks]);

  // Format Due dates
  const formatFriendlyDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[month - 1]} ${day}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex flex-col min-h-0"
    >
      
      {/* Banner / Welcome card */}
      <div className="bg-[#FFFFFF] border border-[#E5E2D9] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-[#2C2C2A] tracking-tight flex items-center gap-2">
            Welcome back, {currentUser.name}!
            <Smile className="h-6 w-6 text-amber-500 hover:scale-110 transition-transform cursor-pointer" />
          </h1>
          <p className="text-xs text-slate-400">
            Good day! Review your workload details. Relative calendar date: <span className="font-semibold text-slate-600">June 2, 2026</span>
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('todo')}
          className="px-4 py-2 bg-[#378ADD] hover:bg-[#185FA5] text-white rounded-lg flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Quick Create Task</span>
        </button>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: My Weekly Progress & Statistics (spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E2D9] p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center">
              <h2 className="text-[15px] font-semibold text-slate-800 tracking-tight">Weekly Progress</h2>
              <span className="text-[10px] font-mono font-bold text-[#378ADD] tracking-wider uppercase bg-[#B5D4F4]/20 px-2 py-0.5 rounded-full">
                LIVE ANALYTICS
              </span>
            </div>
            
            {/* Dynamic visual graph acting as the bento progress chart */}
            <div className="flex items-end justify-between gap-4 pb-2 h-44 mt-6 border-b border-gray-100 mb-4 select-none">
              {/* TO DO block */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div 
                  className="w-full bg-[#B5D4F4]/50 hover:bg-[#B5D4F4]/70 rounded-t-lg relative group transition-all duration-500 hover:scale-[1.02]"
                  style={{ height: `${stats.total > 0 ? Math.max(12, (stats.todo / stats.total) * 100) : 15}%` }}
                  title={`${stats.todo} tasks in To Do`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-slate-500 font-mono">{stats.todo}</div>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">To Do</div>
              </div>

              {/* IN PROGRESS block */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div 
                  className="w-full bg-amber-200/60 hover:bg-amber-300 rounded-t-lg relative group transition-all duration-500 hover:scale-[1.02]"
                  style={{ height: `${stats.total > 0 ? Math.max(12, (stats.inProgress / stats.total) * 100) : 15}%` }}
                  title={`${stats.inProgress} tasks active`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-amber-600 font-mono">{stats.inProgress}</div>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active</div>
              </div>

              {/* IN REVIEW block */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div 
                  className="w-full bg-blue-300/40 hover:bg-blue-300/60 rounded-t-lg relative group transition-all duration-500 hover:scale-[1.02]"
                  style={{ height: `${stats.total > 0 ? Math.max(12, (stats.inReview / stats.total) * 100) : 15}%` }}
                  title={`${stats.inReview} tasks in review`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-blue-600 font-mono">{stats.inReview}</div>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In Review</div>
              </div>

              {/* COMPLETED block */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div 
                  className="w-full bg-[#378ADD] hover:bg-[#185FA5] rounded-t-lg relative group transition-all duration-500 hover:scale-[1.02]"
                  style={{ height: `${stats.total > 0 ? Math.max(12, (stats.done / stats.total) * 100) : 15}%` }}
                  title={`${stats.done} tasks finished`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-[#378ADD] font-mono">{stats.done}</div>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Done</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-8 border-t border-[#F1EFE8] pt-4">
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-800">{stats.todo}</div>
              <div className="text-xs text-slate-500">Backlogged</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-[#E24B4A]">{overdueTasks.length}</div>
              <div className="text-xs text-slate-500">Overdue</div>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-[#639922]">
                {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-500">Productivity Rate</div>
            </div>
          </div>
        </div>

        {/* Card 2: Overdue Highlights (spans 1 column, height matching, stylized in warm rose block!) */}
        <div className="bg-[#FDF2F2] rounded-2xl border border-[#E24B4A]/20 p-6 shadow-xs flex flex-col">
          <h2 className="text-[15px] font-semibold text-[#E24B4A] mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 animate-pulse" />
            Urgent & Overdue
          </h2>

          {overdueTasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-[#E24B4A]/65 italic">
              Zero overdue tasks. Magnificent job!
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-0.5 scrollbar-light">
              {overdueTasks.slice(0, 3).map(t => {
                const proj = projects.find(p => p.id === t.projectId);
                return (
                  <div 
                    key={t.id}
                    onClick={() => onOpenTask(t.id)}
                    className="p-3 bg-white rounded-xl border border-[#E24B4A]/10 shadow-3xs hover:scale-[1.01] transition-all cursor-pointer group"
                  >
                    <div className="text-[10px] font-mono font-bold text-[#E24B4A] mb-1 flex items-center justify-between">
                      <span>{t.id.toUpperCase()}</span>
                      {proj && <span className="uppercase tracking-wide font-semibold text-[9px] bg-rose-50 px-1 py-0.2 rounded" style={{ color: proj.color }}>{proj.name}</span>}
                    </div>
                    <div className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-[#378ADD] transition-colors line-clamp-2">
                      {t.title}
                    </div>
                    <div className="mt-2.5 flex justify-between items-center">
                      <span className="text-[10px] bg-[#E24B4A] text-white font-semibold px-2 py-0.5 rounded-full">
                        Due {formatFriendlyDate(t.dueDate)}
                      </span>
                      <div className="h-5 w-5 rounded-full bg-[#16A34A] text-[9px] text-white flex items-center justify-center font-bold">
                        {currentUser.initials}
                      </div>
                    </div>
                  </div>
                );
              })}
              {overdueTasks.length > 3 && (
                <p className="text-[10px] text-center text-rose-500 font-semibold italic pt-1">
                  + {overdueTasks.length - 3} more overdue tasks
                </p>
              )}
            </div>
          )}
        </div>

        {/* Card 3: Active Projects (spans 1 column, height matching, styled beautifully!) */}
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-800 tracking-tight mb-4 flex items-center gap-2">
              <Folder className="h-4.5 w-4.5 text-slate-400" />
              Active Projects
            </h2>
            <div className="space-y-4">
              {projectStats.slice(0, 3).map(p => (
                <div key={p.id} className="space-y-1.5 pb-1 last:pb-0">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <NavLink to={`/projects/${p.id}`} className="hover:text-[#378ADD] text-slate-800 flex items-center gap-2 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="truncate">{p.name}</span>
                    </NavLink>
                    <span className="text-slate-500 font-mono text-[10px] font-bold">
                      {p.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-[#F1EFE8] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${p.progress}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <NavLink
            to="/projects"
            className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#378ADD] font-bold hover:underline"
          >
            <span>View all project boards</span>
            <ArrowRight className="h-4 w-4 animate-pulse" />
          </NavLink>
        </div>

        {/* Card 4: My Active Tasks (spans 2 columns, height matching, styled like recent activities!) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E2D9] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-semibold text-slate-800 tracking-tight">Active Responsibilities</h2>
              <NavLink to="/search" className="text-xs text-[#378ADD] hover:underline flex items-center gap-0.5 font-bold">
                <span>Filter List</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </NavLink>
            </div>

            {myTasks.filter(t => t.status !== 'done').length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 italic bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                You do not have any active responsibilities right now. Excellent!
              </div>
            ) : (
              <div className="divide-y divide-[#E5E2D9]/70 max-h-[300px] overflow-y-auto pr-0.5">
                {myTasks.filter(t => t.status !== 'done').slice(0, 4).map(t => {
                  const proj = projects.find(p => p.id === t.projectId);
                  return (
                    <div 
                      key={t.id}
                      onClick={() => onOpenTask(t.id)}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 px-1.5 rounded-lg border-b border-gray-50 last:border-b-0 cursor-pointer group transition-colors text-sm"
                    >
                      <div className="space-y-1 truncate pr-4">
                        <span className="font-semibold text-slate-800 group-hover:text-[#378ADD] block truncate">
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          {proj && (
                            <span className="font-semibold text-slate-550 flex items-center gap-1" style={{ color: proj.color }}>
                              <span className="h-2 w-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: proj.color }} />
                              {proj.name}
                            </span>
                          )}
                          <span>&bull;</span>
                          <span className="capitalize text-[11px]">
                            Status: <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">{t.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 shrink-0">
                        <span className={`text-[9px] tracking-wider uppercase font-bold border px-2 py-0.5 rounded-full ${
                          {
                            low: 'bg-stone-55 text-stone-500 border-stone-150',
                            normal: 'bg-blue-55 bg-blue-50/50 text-blue-600 border-blue-150',
                            high: 'bg-amber-50/70 text-amber-700 border-amber-150',
                            urgent: 'bg-rose-50 text-rose-700 border-rose-150'
                          }[t.priority]
                        }`}>
                          {t.priority}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#378ADD] transform group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {myTasks.filter(t => t.status !== 'done').length > 4 && (
            <p className="text-[10px] text-center text-slate-400 font-medium italic pt-2 border-t border-gray-100 select-none">
              + {myTasks.filter(t => t.status !== 'done').length - 4} more active tasks. Use faceted search to view all.
            </p>
          )}
        </div>

      </div>

    </motion.div>
  );
};
