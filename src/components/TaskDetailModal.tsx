/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { X, Calendar, MessageSquare, AlertCircle, Trash2, Send, Clock, Plus, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    projects,
    users,
    comments,
    currentUser,
    updateTask,
    deleteTask,
    addComment,
    showToast
  } = useApp();

  const task = tasks.find(t => t.id === taskId);

  // Editable fields copy
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  const [editedDescription, setEditedDescription] = useState('');
  const [isDescFocused, setIsDescFocused] = useState(false);

  // Comments copy
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Tags inline copy
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setCommentText('');
      setNewTagInput('');
      setIsAddingTag(false);
      setIsEditingTitle(false);
    }
  }, [task]);

  // Click outside & Escape support
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (taskId && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && taskId) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [taskId, onClose]);

  if (!task) return null;

  const project = projects.find(p => p.id === task.projectId);
  const taskComments = comments.filter(c => c.taskId === task.id).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Save Title Changes
  const handleSaveTitle = () => {
    if (!editedTitle.trim()) {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
      return;
    }
    if (editedTitle.trim() !== task.title) {
      updateTask({
        ...task,
        title: editedTitle.trim()
      });
      showToast('Task title updated', 'success');
    }
    setIsEditingTitle(false);
  };

  // Save Description Changes
  const handleSaveDescription = () => {
    if (editedDescription.trim() !== (task.description || '')) {
      updateTask({
        ...task,
        description: editedDescription.trim() || undefined
      });
      showToast('Task description updated', 'success');
    }
    setIsDescFocused(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as TaskStatus;
    updateTask({ ...task, status });
    showToast(`Task moved to ${status.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const priority = e.target.value as TaskPriority;
    updateTask({ ...task, priority });
    showToast(`Priority updated to ${priority.toUpperCase()}`, 'success');
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    updateTask({ ...task, assigneeId: val || undefined });
    const u = users.find(x => x.id === val);
    showToast(u ? `Assigned to ${u.name}` : 'Task unassigned', 'success');
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateTask({ ...task, dueDate: val || undefined });
    showToast(val ? `Due date set to ${val}` : 'Due date cleared', 'success');
  };

  // Add tag
  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().toLowerCase();
    if (tag) {
      if (!task.labels.includes(tag)) {
        const labels = [...task.labels, tag];
        updateTask({ ...task, labels });
        showToast(`Label #${tag} added`, 'success');
      }
      setNewTagInput('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const labels = task.labels.filter(l => l !== tagToRemove);
    updateTask({ ...task, labels });
    showToast(`Label #${tagToRemove} removed`, 'info');
  };

  // Comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);

    // Optimistic delay simulation for spinner feedback
    await new Promise(resolve => setTimeout(resolve, 600));

    addComment(task.id, currentUser.id, commentText.trim());
    setCommentText('');
    setIsSubmittingComment(false);
    showToast('Comment posted', 'success');
  };

  const handleDeleteTaskClick = () => {
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTask(task.id);
      onClose();
    }
  };

  // Get Relative date humanizer
  const formatTimeAgo = (isoStr: string) => {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffDay > 30) {
      return date.toLocaleDateString();
    }
    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHr > 0) return `${diffHr}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  const characterCount = commentText.length;
  const isOverLimit = characterCount > 2000;

  return (
    <AnimatePresence>
      {taskId && (
        <>
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
          />

          {/* Modal content container */}
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-[#FFFFFF] rounded-xl shadow-2xl w-full max-w-[760px] flex flex-col overflow-hidden max-h-[85vh] border border-gray-100"
            >
              {/* Header bar */}
              <div className="flex items-center justify-between p-5 border-b border-gray-150 bg-gray-55/7 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-amber-50 rounded-md border border-amber-200/60 text-amber-800 font-bold px-2 py-0.5 select-none uppercase shadow-xs">
                    {task.id}
                  </span>
                  {project && (
                    <span 
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${project.color}15`, 
                        color: project.color 
                      }}
                    >
                      {project.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* Delete button option */}
                  <button
                    onClick={handleDeleteTaskClick}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                    title="Delete task"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-150 cursor-pointer transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: split two-column */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
                
                {/* Left Column (60% on desktop) */}
                <div className="md:col-span-7 p-6 space-y-6 border-r border-gray-100">
                  
                  {/* Title heading: Inline editable */}
                  <div className="space-y-1">
                    {isEditingTitle ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                        className="w-full text-lg font-semibold bg-[#FFFFFF] border-2 border-[#378ADD] rounded px-2.5 py-1 focus:ring-1 focus:ring-blue-100 focus:outline-hidden"
                        maxLength={200}
                        autoFocus
                      />
                    ) : (
                      <h2
                        onClick={() => setIsEditingTitle(true)}
                        className="text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 p-2 rounded -ml-2 border border-transparent hover:border-dashed hover:border-gray-200 transition-all leading-snug"
                        title="Click to edit title"
                      >
                        {task.title}
                      </h2>
                    )}
                  </div>

                  {/* Description segment */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Description
                    </label>
                    
                    <div className="relative">
                      <textarea
                        placeholder="Add details for this task..."
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onFocus={() => setIsDescFocused(true)}
                        onBlur={() => {
                          // Allow a tiny delay for click event targets inside edit buttons to engage
                          setTimeout(() => {
                            if (!isDescFocused) return;
                          }, 100);
                        }}
                        className={`w-full text-sm bg-white border border-gray-200 rounded-lg p-3 focus:outline-hidden transition-all text-gray-800 ${
                          isDescFocused 
                            ? 'ring-2 ring-blue-100 border-[#378ADD] min-h-[140px]' 
                            : 'hover:border-gray-300 min-h-[70px] resize-none'
                        }`}
                      />
                      
                      {isDescFocused && (
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditedDescription(task.description || '');
                              setIsDescFocused(false);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-150 border border-gray-200 rounded-md text-gray-700 cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveDescription}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-[#378ADD] hover:bg-[#185FA5] text-white rounded-md cursor-pointer transition-colors shadow-xs"
                          >
                            Save Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Labels Section */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                      Labels
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {task.labels.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs bg-[#B5D4F4]/30 text-[#185FA5] px-2.5 py-1 rounded-full font-medium">
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-[#185FA5] hover:text-[#E24B4A] font-bold text-sm leading-none p-0.5 hover:bg-black/5 rounded cursor-pointer"
                          >
                            &times;
                          </button>
                        </span>
                      ))}

                      {isAddingTag ? (
                        <form onSubmit={handleAddTagSubmit} className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="Label name"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onBlur={() => {
                              // delay close tag
                              setTimeout(() => {
                                if (!newTagInput) setIsAddingTag(false);
                              }, 200);
                            }}
                            className="border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:ring-1 focus:ring-[#378ADD] focus:outline-hidden bg-white max-w-[100px]"
                            maxLength={30}
                            autoFocus
                          />
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsAddingTag(true)}
                          className="inline-flex items-center gap-1 text-xs text-gray-500 border border-dashed border-gray-300 hover:border-[#378ADD] hover:text-[#378ADD] px-2.5 py-1 rounded-full cursor-pointer transition-colors bg-white font-medium"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Label</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Feed */}
                  <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="h-4.5 w-4.5 text-gray-400" />
                        Discussion Thread
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                        {taskComments.length} comment{taskComments.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {/* Comments block */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {taskComments.length === 0 ? (
                        <div className="text-center py-4 text-xs text-gray-400 italic bg-gray-50 rounded-lg">
                          No comments posted yet.
                        </div>
                      ) : (
                        taskComments.map(comment => {
                          const author = users.find(u => u.id === comment.authorId);
                          return (
                            <div key={comment.id} className="flex gap-2.5 text-sm p-3 bg-gray-100/50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200/20">
                              <div
                                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5 shadow-xs"
                                style={{ backgroundColor: author?.color || '#999' }}
                              >
                                {author?.initials || '??'}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-gray-800 text-xs">
                                    {author?.name || 'Unknown User'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Comment Area input */}
                    <form onSubmit={handleCommentSubmit} className="space-y-2 pt-2">
                      <div className="relative">
                        <textarea
                          placeholder="Write a response... (Press Send)"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          maxLength={2100}
                          className={`w-full text-xs bg-white border border-gray-200 rounded-lg p-3 pr-10 focus:outline-hidden transition-all text-gray-800 min-h-[60px] max-h-[140px] resize-y`}
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim() || isSubmittingComment || isOverLimit}
                          className={`absolute right-2 bottom-3 p-1.5 rounded-md cursor-pointer transition-all flex items-center justify-center ${
                            commentText.trim() && !isOverLimit && !isSubmittingComment
                              ? 'text-[#378ADD] hover:bg-blue-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title="Post comment"
                        >
                          {isSubmittingComment ? (
                            <span className="h-4 w-4 border-2 border-[#378ADD] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Character limit feedback counter */}
                      {characterCount >= 1800 && (
                        <p className={`text-[10px] text-right font-medium ${isOverLimit ? 'text-rose-600' : 'text-amber-600'}`}>
                          {characterCount} / 2000 characters{isOverLimit && ' (Limit exceeded)'}
                        </p>
                      )}
                    </form>

                  </div>

                </div>

                {/* Right Column (40% on desktop) */}
                <div className="md:col-span-5 p-6 space-y-5 bg-gray-50/50">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Task Metadata
                  </h3>

                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
                      Status
                    </label>
                    <select
                      value={task.status}
                      onChange={handleStatusChange}
                      className="w-full text-xs font-medium bg-[#FFFFFF] border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  {/* Assignee select list */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
                      Assignee
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={task.assigneeId || ''}
                        onChange={handleAssigneeChange}
                        className="flex-1 text-xs font-medium bg-[#FFFFFF] border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Priority Select dropdown color coordinated */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
                      Priority
                    </label>
                    <select
                      value={task.priority}
                      onChange={handlePriorityChange}
                      className="w-full text-xs font-medium bg-[#FFFFFF] border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Due Date configuration picker */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block">
                      Due Date
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={handleDueDateChange}
                        className="w-full text-xs font-medium bg-[#FFFFFF] border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Quick Metadata summary display info for PM and Leads */}
                  <div className="pt-4 border-t border-gray-150 space-y-2 text-[11px] text-gray-500">
                    <div className="flex justify-between">
                      <span>Created On:</span>
                      <span className="font-mono text-gray-700 font-medium">{task.createdAt}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex justify-between">
                        <span>Status Timeframe:</span>
                        <span className={`font-medium ${task.status === 'done' ? 'text-green-600' : 'text-gray-700'}`}>
                          {task.status === 'done' ? 'Completed' : 'Active'}
                        </span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
