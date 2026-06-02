/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TaskPriority, TaskStatus } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialStatus?: TaskStatus;
  initialProjectId?: string;
}

export const CreateTaskDrawer: React.FC<CreateTaskDrawerProps> = ({
  isOpen,
  onClose,
  initialStatus = 'todo',
  initialProjectId = ''
}) => {
  const { projects, users, addTask } = useApp();

  const [title, setTitle] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [titleError, setTitleError] = useState('');

  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId || (projects[0]?.id || ''));
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [dueDate, setDueDate] = useState('');
  const [dueDateWarning, setDueDateWarning] = useState('');

  // Local state for tags
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync initial variables when drawer open status changes
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setTitleTouched(false);
      setTitleError('');
      setDescription('');
      setProjectId(initialProjectId || (projects[0]?.id || ''));
      setAssigneeId('');
      setPriority('normal');
      setDueDate('');
      setDueDateWarning('');
      setLabels([]);
      setLabelInput('');
    }
  }, [isOpen, initialProjectId, projects]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    // Esc key support
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Client-side validations
  const validateTitle = (val: string) => {
    if (!val.trim()) {
      return 'Task title is required';
    }
    if (val.length > 200) {
      return 'Title cannot exceed 200 characters';
    }
    return '';
  };

  const handleTitleBlur = () => {
    setTitleTouched(true);
    setTitleError(validateTitle(title));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (titleTouched) {
      setTitleError(validateTitle(val));
    }
  };

  // Validate due date: Cannot be in past at creation
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setDueDate(dateVal);

    if (dateVal) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(`${dateVal}T00:00:00Z`);
      if (selected < today) {
        setDueDateWarning('Warning: Due date is in the past!');
      } else {
        setDueDateWarning('');
      }
    } else {
      setDueDateWarning('');
    }
  };

  // Tag interactions
  const handleAddLabel = () => {
    const trimmed = labelInput.trim().toLowerCase();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (tagToRemove: string) => {
    setLabels(labels.filter(label => label !== tagToRemove));
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel();
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateTitle(title);
    if (err) {
      setTitleTouched(true);
      setTitleError(err);
      return;
    }

    addTask({
      projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      status: initialStatus,
      priority,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate || undefined,
      labels
    });

    onClose();
  };

  const activeAssignee = users.find(u => u.id === assigneeId);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-xs"
          />

          {/* Sliding container */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#FFFFFF] shadow-2xl z-50 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#378ADD]" />
                  Create New Task
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Adding task to <span className="font-semibold text-gray-700 uppercase">{initialStatus.replace('_', ' ')}</span>
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-150 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title Input */}
              <div className="space-y-1.5ClassName">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Integrate checkout form"
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  className={`w-full text-sm bg-[#FFFFFF] border rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-2 transition-all ${
                    titleError
                      ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                      : 'border-gray-200 focus:ring-[#B5D4F4] focus:border-[#378ADD]'
                  }`}
                  maxLength={200}
                  autoFocus
                />
                {titleError && (
                  <p className="text-xs text-[#E24B4A] font-medium leading-none mt-1">
                    {titleError}
                  </p>
                )}
              </div>

              {/* Description textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  placeholder="Describe the scope or requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm bg-[#FFFFFF] border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#B5D4F4] focus:border-[#378ADD] min-h-[100px] resize-y transition-all"
                />
              </div>

              {/* Project Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Project
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full text-sm bg-[#FFFFFF] border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-[#B5D4F4] focus:border-[#378ADD] transition-all cursor-pointer"
                >
                  {projects.map(proj => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee Selection with Avatar Grid */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Assignee
                </label>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {users.map(u => {
                    const isSelected = assigneeId === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setAssigneeId(u.id === assigneeId ? '' : u.id)}
                        className={`group relative flex flex-col items-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#378ADD] bg-blue-50/50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-xs mb-1"
                          style={{ backgroundColor: u.color }}
                        >
                          {u.initials}
                        </div>
                        <span className="text-[10px] text-gray-600 truncate max-w-full font-medium">
                          {u.name.split(' ')[0]}
                        </span>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-gray-900 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap z-50">
                          {u.name} — {u.role}
                        </div>
                      </button>
                    );
                  })}
                  
                  {/* Unassigned Option button */}
                  <button
                    type="button"
                    onClick={() => setAssigneeId('')}
                    className={`flex flex-col items-center p-2 rounded-lg border text-center cursor-pointer transition-all ${
                      assigneeId === ''
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-dashed border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[10px] mb-1 font-bold">
                      —
                    </div>
                    <span className="text-[10px] font-medium">None</span>
                  </button>
                </div>
              </div>

              {/* Priority - Segmented Control */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Priority
                </label>
                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200/50">
                  {(['low', 'normal', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                    const isSelected = priority === p;
                    const colors = {
                      low: 'text-gray-700 bg-white border border-gray-250',
                      normal: 'text-blue-700 bg-white border border-blue-250',
                      high: 'text-amber-700 bg-white border border-amber-250',
                      urgent: 'text-rose-700 bg-rose-50 border border-rose-300'
                    };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 text-center py-1.5 text-xs font-medium rounded-md capitalize cursor-pointer transition-all ${
                          isSelected
                            ? `${colors[p]} shadow-sm`
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={handleDateChange}
                  className="w-full text-sm bg-[#FFFFFF] border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#B5D4F4] focus:border-[#378ADD] transition-all cursor-pointer"
                />
                {dueDateWarning && (
                  <p className="text-xs text-[#BA7517] font-medium mt-1">
                    {dueDateWarning}
                  </p>
                )}
              </div>

              {/* Labels (Tag Input with Autocomplete) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Labels / Tags
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Type and press Enter, e.g. engineering"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={handleLabelKeyDown}
                    className="flex-1 text-sm bg-[#FFFFFF] border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-[#B5D4F4] focus:border-[#378ADD] transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddLabel}
                    className="px-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-150 text-gray-700 cursor-pointer text-xs font-semibold transition-colors"
                  >
                    Add
                  </button>
                </div>

                {labels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {labels.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs bg-[#B5D4F4]/30 text-[#185FA5] px-2 py-0.5 rounded"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveLabel(tag)}
                          className="hover:bg-red-50 text-[#185FA5] hover:text-red-500 rounded p-0.5 cursor-pointer leading-none font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {/* Footer buttons */}
            <div className="p-5 border-t border-gray-150 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-white text-gray-700 cursor-pointer transition-all"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleCreate}
                disabled={!title.trim()}
                className={`px-5 py-2 text-sm font-semibold text-white rounded-lg cursor-pointer shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 ${
                  title.trim()
                    ? 'bg-[#378ADD] hover:bg-[#185FA5]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                }`}
              >
                Create Task
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
