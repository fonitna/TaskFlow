/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task, User } from '../types';
import { useApp } from '../context/AppContext';
import { MessageSquare, Calendar, GripVertical, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { users, projects } = useApp();
  
  const assignee = users.find(u => u.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);

  const isOverdue = React.useMemo(() => {
    if (!task.dueDate || task.status === 'done') return false;
    const systemDateStr = new Date().toISOString().split('T')[0];
    return task.dueDate < systemDateStr;
  }, [task.dueDate, task.status]);

  const getPriorityStyles = (p: Task['priority']) => {
    switch (p) {
      case 'urgent':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200/60', text: 'Urgent' };
      case 'high':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', text: 'High' };
      case 'normal':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200/60', text: 'Normal' };
      case 'low':
        return { bg: 'bg-gray-55/6 bg-slate-50 text-slate-600 border-slate-200/60', text: 'Low' };
    }
  };

  const priorityStyle = getPriorityStyles(task.priority);

  // Format Due date
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[month - 1]} ${day}, ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    // Small feedback
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '1';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="group relative bg-[#FFFFFF] border border-gray-200 hover:border-[#378ADD] hover:shadow-md rounded-lg p-4 cursor-pointer transition-all active:scale-[0.99] duration-150 select-none"
      onClick={() => onClick(task.id)}
      id={`card-${task.id}`}
    >
      {/* Top row: Project indicator & Drag handle */}
      <div className="flex items-center justify-between mb-2">
        {project ? (
          <span 
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{ 
              backgroundColor: `${project.color}15`, 
              color: project.color 
            }}
          >
            {project.name}
          </span>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium rounded-full border ${priorityStyle.bg}`}>
            {priorityStyle.text}
          </span>
          <div className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-100 rounded text-gray-400 cursor-grab active:cursor-grabbing transition-opacity">
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Task title */}
      <h4 className="text-[14px] font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-[#378ADD] transition-colors leading-[1.4]">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags / Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {task.labels.map(tag => (
            <span key={tag} className="text-[11px] bg-[#B5D4F4]/20 text-[#185FA5] px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row: Comments, Dates, Assignee */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
        <div className="flex items-center gap-3 text-gray-500">
          {/* Due date status badge */}
          {task.dueDate && (
            <div 
              className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                task.status === 'done'
                  ? 'bg-emerald-50 text-emerald-700'
                  : isOverdue
                  ? 'bg-rose-50 text-[#E24B4A] font-semibold animate-pulse'
                  : 'bg-stone-100 text-stone-600'
              }`}
              title={isOverdue ? "Overdue Task!" : "Due Date"}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}

          {/* Comment count */}
          {task.commentCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] hover:text-[#378ADD]">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{task.commentCount}</span>
            </div>
          )}

          {task.status === 'done' && (
            <div className="text-emerald-600" title="Completed">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {assignee ? (
          <div 
            className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold tracking-wider border border-white shadow-sm"
            style={{ backgroundColor: assignee.color }}
            title={`${assignee.name} (${assignee.role})`}
          >
            {assignee.initials}
          </div>
        ) : (
          <div className="h-7 w-7 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px]" title="Unassigned">
            —
          </div>
        )}
      </div>
    </div>
  );
};
