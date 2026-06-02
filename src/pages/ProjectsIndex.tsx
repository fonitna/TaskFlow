/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Folder, Plus, Users, Calendar, ArrowRight, Sparkles, AlertCircle, GripVertical } from 'lucide-react';
import { motion } from 'motion/react';

export const ProjectsIndex: React.FC = () => {
  const { projects, tasks, users, addProject, reorderProjects } = useApp();
  const navigate = useNavigate();

  // Create Project inline form toggles
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projName, setProjName] = useState('');
  const [projColor, setProjColor] = useState('#378ADD');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [errorText, setErrorText] = useState('');

  // State for drag and drop sorting
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    reorderProjects(draggedIndex, targetIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Project colors list presets
  const colorPresets = ['#378ADD', '#1D9E75', '#D4537E', '#BA7517', '#533AB7', '#639922', '#E24B4A'];

  // Calculate project statistics
  const projectsData = React.useMemo(() => {
    return projects.map(proj => {
      const projTasks = tasks.filter(t => t.projectId === proj.id);
      const totalCount = projTasks.length;
      const todoCount = projTasks.filter(t => t.status === 'todo').length;
      const progressCount = projTasks.filter(t => t.status === 'in_progress').length;
      const reviewCount = projTasks.filter(t => t.status === 'in_review').length;
      const doneCount = projTasks.filter(t => t.status === 'done').length;
      const activeCount = totalCount - doneCount;

      const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

      return {
        ...proj,
        totalCount,
        doneCount,
        activeCount,
        progress: progressPercent
      };
    });
  }, [projects, tasks]);

  const handleMemberToggle = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = projName.trim();

    // Client-side validation: 3-50 chars, unique name
    if (trimmed.length < 3 || trimmed.length > 50) {
      setErrorText('Project name must be between 3 and 50 characters.');
      return;
    }

    const isDuplicate = projects.some(p => p.name.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      setErrorText('Project name must be unique in this workspace.');
      return;
    }

    // Success
    addProject(trimmed, projColor, selectedMembers);
    
    // Reset Form
    setProjName('');
    setProjColor('#378ADD');
    setSelectedMembers([]);
    setErrorText('');
    setShowCreateForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto"
    >
      
      {/* Upper Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Team Workspace Projects
          </h1>
          <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-1.5 md:gap-2">
            <span>Monitor and coordinate tasks across all active work streams.</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#378ADD] bg-[#B5D4F4]/20 px-2 py-0.5 rounded-full select-none uppercase tracking-wider">
              <GripVertical className="h-3 w-3" />
              Drag to reorder
            </span>
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm ${
            showCreateForm
              ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              : 'bg-[#378ADD] hover:bg-[#185FA5] text-white'
          }`}
        >
          {showCreateForm ? <Folder className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showCreateForm ? 'View Projects Grid' : 'Create New Project'}</span>
        </button>
      </div>

      {/* Slide down project creation drawer/block if triggered */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFFFFF] border-2 border-dashed border-[#B5D4F4] rounded-xl p-6 shadow-sm max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[#378ADD]" />
            <h3 className="text-sm font-bold text-gray-900">Define Project Context</h3>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Project name input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Mobile App v2, Website Maintenance"
                value={projName}
                onChange={(e) => {
                  setProjName(e.target.value);
                  setErrorText('');
                }}
                className={`w-full text-sm bg-white border rounded-lg px-3 py-2.5 focus:outline-hidden focus:ring-2 ${
                  errorText 
                    ? 'border-rose-300 focus:ring-rose-200' 
                    : 'border-gray-200 focus:ring-[#B5D4F4]'
                }`}
                maxLength={50}
                required
              />
              {errorText && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errorText}
                </p>
              )}
            </div>

            {/* Hex Color preset picker */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest">
                Interface Color Code Accent
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {colorPresets.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setProjColor(c)}
                    className={`h-7 w-7 rounded-lg relative cursor-pointer flex items-center justify-center transition-all ${
                      projColor === c ? 'scale-110 shadow-md ring-2 ring-blue-100' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {projColor === c && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection member checklist */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest">
                Assign Members
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {users.map(u => {
                  const isChecked = selectedMembers.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleMemberToggle(u.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#378ADD] bg-blue-50/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="h-6 w-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: u.color }}
                      >
                        {u.initials}
                      </div>
                      <span className="text-xs font-medium text-gray-800 truncate">
                        {u.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action controls */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setProjName('');
                  setErrorText('');
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={projName.trim().length < 3}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer transition-all ${
                  projName.trim().length >= 3
                    ? 'bg-[#378ADD] hover:bg-[#185FA5] shadow-xs'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Create Project
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Projects Card Grid list */}
      {projectsData.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-gray-200 rounded-xl p-12 text-center max-w-sm mx-auto space-y-4">
          <Folder className="mx-auto h-12 w-12 text-gray-300" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-900">No Projects</h3>
            <p className="text-xs text-gray-400">Define your first workspace project to start assigning tasks.</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-[#378ADD] text-white hover:bg-[#185FA5] rounded-lg text-xs font-semibold cursor-pointer"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map((proj, index) => {
            const isDragged = draggedIndex === index;
            const isOver = dragOverIndex === index;

            return (
              <div
                key={proj.id}
                onClick={() => {
                  // If a drag-and-drop was in progress, ignore click to prevent accidental page transitions
                  if (draggedIndex !== null) return;
                  navigate(`/projects/${proj.id}`);
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`group relative bg-[#FFFFFF] border rounded-xl p-5 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 flex flex-col justify-between ${
                  isDragged ? 'opacity-30 border-dashed border-[#378ADD] scale-95' : 'border-gray-200 hover:border-[#378ADD]'
                } ${
                  isOver ? 'ring-2 ring-dashed ring-[#378ADD] bg-blue-50/5 scale-[1.01]' : ''
                }`}
              >
                {/* Visual Color stripe */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl"
                  style={{ backgroundColor: proj.color }}
                />

                <div className="space-y-4">
                  {/* Title & Chevron link */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                      <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#378ADD] transition-colors leading-none truncate">
                        {proj.name}
                      </h3>
                      <span className="text-[10px] text-gray-400 font-mono tracking-wide uppercase">
                        ID: {proj.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="h-6 w-6 rounded-md bg-stone-100/50 flex items-center justify-center text-stone-400 group-hover:bg-blue-50 group-hover:text-[#378ADD] shrink-0 transition-colors">
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div 
                        className="h-6 w-6 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-500 shrink-0"
                        title="Drag card to reorder project"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Task numbers stats breakdown */}
                  <div className="grid grid-cols-3 gap-2 border-y border-gray-100 py-3 text-center text-xs">
                    <div>
                      <span className="block font-bold text-gray-900 leading-none">{proj.totalCount}</span>
                      <span className="text-[10px] text-gray-400 font-medium block mt-1">Total</span>
                    </div>
                    <div>
                      <span className="block font-bold text-[#BA7517] leading-none">{proj.activeCount}</span>
                      <span className="text-[10px] text-gray-400 font-medium block mt-1">Active</span>
                    </div>
                    <div>
                      <span className="block font-bold text-emerald-700 leading-none">{proj.doneCount}</span>
                      <span className="text-[10px] text-gray-400 font-medium block mt-1">Resolved</span>
                    </div>
                  </div>

                  {/* Range Progress meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium text-gray-500">
                      <span>Development Status</span>
                      <span>{proj.progress}% Done</span>
                    </div>
                    
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-400"
                        style={{ 
                          width: `${proj.progress}%`,
                          backgroundColor: proj.color 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-100 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{proj.members.length} team lead{proj.members.length === 1 ? '' : 's'}</span>
                  </div>

                  {/* Avatar roster circles */}
                  <div className="flex -space-x-1.5">
                    {proj.members.map(uId => {
                      const user = users.find(x => x.id === uId);
                      return (
                        <div
                          key={uId}
                          className="h-5 w-5 rounded-full text-[8px] font-bold text-white flex items-center justify-center border border-white"
                          style={{ backgroundColor: user?.color || '#ccc' }}
                          title={user?.name}
                        >
                          {user?.initials || '??'}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </motion.div>
  );
};
