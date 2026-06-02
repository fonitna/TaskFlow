/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TaskCard } from '../components/TaskCard';
import { Task, TaskPriority, TaskStatus } from '../types';
import { 
  Trello, 
  List, 
  Settings, 
  Plus, 
  Search, 
  UserPlus, 
  SlidersHorizontal, 
  X, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectDetailProps {
  onOpenTask: (id: string) => void;
  onOpenQuickAdd: (status: TaskStatus, projectId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ onOpenTask, onOpenQuickAdd }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    projects, 
    tasks, 
    users, 
    moveTask, 
    updateTask, 
    deleteTask, 
    showToast 
  } = useApp();

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  // View state: 'kanban' | 'list'
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban');

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sorting for list view
  const [listSortKey, setListSortKey] = useState<'title' | 'priority' | 'dueDate'>('title');
  const [listSortOrder, setListSortOrder] = useState<'asc' | 'desc'>('asc');

  // Bulk actions for list view
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([]);

  // Local drop targets visual helper state
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Handle if project doesn't exist
  if (!project) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <div>
          <h2 className="text-base font-bold text-gray-900">Project Not Found</h2>
          <p className="text-xs text-gray-500 mt-1">The project request does not exist or was deleted.</p>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-[#378ADD] text-white hover:bg-[#185FA5] rounded-md text-xs font-semibold cursor-pointer"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  // Tasks belonging to this project
  const projectTasks = useMemo(() => {
    return tasks.filter(t => t.projectId === project.id);
  }, [tasks, project.id]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return projectTasks.filter(t => {
      // Keyword search (title & description)
      const matchesSearch = searchQuery.trim() === '' || 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Assignee fit
      const matchesAssignee = selectedAssignees.length === 0 || 
        (t.assigneeId && selectedAssignees.includes(t.assigneeId));

      // Priority fit
      const matchesPriority = selectedPriorities.length === 0 || 
        selectedPriorities.includes(t.priority);

      // Status fit
      const matchesStatus = selectedStatuses.length === 0 || 
        selectedStatuses.includes(t.status);

      return matchesSearch && matchesAssignee && matchesPriority && matchesStatus;
    });
  }, [projectTasks, searchQuery, selectedAssignees, selectedPriorities, selectedStatuses]);

  // List sorting helper
  const sortedTasks = useMemo(() => {
    if (viewType !== 'list') return filteredTasks;

    return [...filteredTasks].sort((a, b) => {
      let valA: any = a[listSortKey] || '';
      let valB: any = b[listSortKey] || '';

      // Priority ordering scale mapping
      if (listSortKey === 'priority') {
        const priorityScale = { low: 1, normal: 2, high: 3, urgent: 4 };
        valA = priorityScale[a.priority];
        valB = priorityScale[b.priority];
      }

      if (valA < valB) return listSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return listSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTasks, viewType, listSortKey, listSortOrder]);

  const hasActiveFilters = 
    searchQuery.trim() !== '' || 
    selectedAssignees.length > 0 || 
    selectedPriorities.length > 0 || 
    selectedStatuses.length > 0;

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedAssignees([]);
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    showToast('Filters cleared', 'info');
  };

  const handleToggleAssigneeFilter = (uId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(uId) ? prev.filter(x => x !== uId) : [...prev, uId]
    );
  };

  const handleTogglePriorityFilter = (p: TaskPriority) => {
    setSelectedPriorities(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleToggleStatusFilter = (s: TaskStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  // Drag-and-drop triggers
  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setDragOverColumn(col);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskIdString = e.dataTransfer.getData('text/plain');
    if (taskIdString) {
      moveTask(taskIdString, targetStatus);
      showToast(`Task status updated`, 'success');
      
      // Success feedback animation trig
      const el = document.getElementById(`card-${taskIdString}`);
      if (el) {
        el.classList.add('ring-2', 'ring-emerald-500');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-emerald-500');
        }, 1000);
      }
    }
  };

  // Bulk actions triggers
  const handleToggleBulkSelect = (taskId: string) => {
    setBulkSelectedIds(prev => 
      prev.includes(taskId) ? prev.filter(x => x !== taskId) : [...prev, taskId]
    );
  };

  const handleToggleAllBulkSelect = () => {
    if (bulkSelectedIds.length === sortedTasks.length) {
      setBulkSelectedIds([]);
    } else {
      setBulkSelectedIds(sortedTasks.map(t => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete these ${bulkSelectedIds.length} tasks?`)) {
      bulkSelectedIds.forEach(id => deleteTask(id));
      setBulkSelectedIds([]);
    }
  };

  const handleBulkMoveStatus = (status: TaskStatus) => {
    bulkSelectedIds.forEach(id => {
      const taskObj = tasks.find(t => t.id === id);
      if (taskObj) {
        updateTask({ ...taskObj, status });
      }
    });
    setBulkSelectedIds([]);
    showToast(`Batch moved ${bulkSelectedIds.length} tasks to ${status.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const handleBulkUnassign = () => {
    bulkSelectedIds.forEach(id => {
      const taskObj = tasks.find(t => t.id === id);
      if (taskObj) {
        updateTask({ ...taskObj, assigneeId: undefined });
      }
    });
    setBulkSelectedIds([]);
    showToast(`Batch unassigned ${bulkSelectedIds.length} tasks`, 'info');
  };

  const handleSortToggle = (key: 'title' | 'priority' | 'dueDate') => {
    if (listSortKey === key) {
      setListSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setListSortKey(key);
      setListSortOrder('asc');
    }
  };

  // Columns definition
  const COLUMNS = [
    { key: 'todo', label: 'To Do', colorHex: '#4A5568' },
    { key: 'in_progress', label: 'In Progress', colorHex: '#378ADD' },
    { key: 'in_review', label: 'In Review', colorHex: '#BA7517' },
    { key: 'done', label: 'Done', colorHex: '#639922' }
  ] as const;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto flex flex-col min-h-0">
      
      {/* Top Details Nav headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md" style={{ backgroundColor: project.color }} />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
          </div>
          <p className="text-xs text-gray-400">
            Created on <span className="font-semibold text-gray-700">{project.createdAt}</span> &bull; 
            Total: <span className="font-semibold text-gray-700">{projectTasks.length} tasks</span>
          </p>
        </div>

        {/* Action button triggers for views config */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Segment View Selector */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => { setViewType('kanban'); setBulkSelectedIds([]); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewType === 'kanban' 
                  ? 'bg-white text-[#378ADD] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Trello className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kanban Board</span>
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewType === 'list' 
                  ? 'bg-white text-[#378ADD] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List View</span>
            </button>
          </div>

          {/* Project Settings direct Link */}
          <NavLink
            to={`/settings?project=${project.id}`}
            className="p-2 bg-[#FFFFFF] border border-gray-200 rounded-lg hover:border-[#378ADD] text-gray-500 hover:text-[#378ADD] transition-colors cursor-pointer"
            title="Project Board Settings"
          >
            <Settings className="h-4 w-4" />
          </NavLink>

          {/* Create Task buttons */}
          <button
            onClick={() => onOpenQuickAdd('todo', project.id)}
            className="px-4 py-2 bg-[#378ADD] hover:bg-[#185FA5] text-white rounded-lg flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter bar controller */}
      <div className="bg-[#FFFFFF] p-4 border border-gray-200 rounded-xl space-y-3 shadow-3xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Keyword entry search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search keyword across project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-gray-200 focus:border-[#378ADD] focus:ring-1 focus:ring-[#B5D4F4] text-xs py-2 pl-9 pr-4 rounded-lg focus:outline-hidden transition-all text-gray-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Quick Assignees multiselect avatar picker */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">Assignees:</span>
              <div className="flex -space-x-1">
                {users.map(u => {
                  const isSelected = selectedAssignees.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleToggleAssigneeFilter(u.id)}
                      className={`h-6.5 w-6.5 rounded-full text-[9px] font-bold text-white border-2 flex items-center justify-center transition-all cursor-pointer leading-none ${
                        isSelected 
                          ? 'border-[#378ADD] scale-110 shadow-sm ring-1 ring-[#378ADD]/30' 
                          : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: u.color }}
                      title={`${u.name} — Click to filter`}
                    >
                      {u.initials}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faceted Mobile Filter Trigger Toggles */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-1.5 border border-gray-200 rounded-lg hover:border-gray-300 text-gray-600 bg-gray-50 cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Priority / Status</span>
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Sub-Filters (Priority/Status dropdown sliders) */}
        {(showMobileFilters || hasActiveFilters) && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-4 items-center text-xs">
            
            {/* Priority pill selection row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-gray-500">Priority:</span>
              {(['low', 'normal', 'high', 'urgent'] as TaskPriority[]).map(p => {
                const active = selectedPriorities.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => handleTogglePriorityFilter(p)}
                    className={`px-2.5 py-1 text-[11px] font-semibold border rounded-full capitalize cursor-pointer transition-all ${
                      active 
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-3xs' 
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Status filters selection row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-gray-500">Status:</span>
              {COLUMNS.map(col => {
                const active = selectedStatuses.includes(col.key);
                return (
                  <button
                    key={col.key}
                    onClick={() => handleToggleStatusFilter(col.key)}
                    className={`px-2.5 py-1 text-[11px] font-semibold border rounded-full cursor-pointer transition-all ${
                      active 
                        ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-3xs' 
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {col.label}
                  </button>
                );
              })}
            </div>

            {/* Clear All action display */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="text-xs text-[#E24B4A] hover:underline font-bold flex items-center gap-1 transition-all cursor-pointer ml-auto"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Area View Render Option */}
      <div className="flex-1 min-h-0">
        
        {/* VIEW 1: INTERACTIVE KANBAN BOARD VIEW */}
        {viewType === 'kanban' ? (
          <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-4 min-w-[920px] md:min-w-0 md:grid md:grid-cols-4 items-start">
              {COLUMNS.map(col => {
                const columnTasks = sortedTasks.filter(t => t.status === col.key);

                return (
                  <div
                    key={col.key}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.key)}
                    className={`flex flex-col bg-gray-100 rounded-xl max-h-[70vh] p-3 border-2 border-transparent transition-all overflow-hidden ${
                      dragOverColumn === col.key ? 'drag-over-column border-dashed' : ''
                    }`}
                  >
                    {/* Column Heading */}
                    <div className="flex items-center justify-between pb-3.5 px-1.5 shrink-0 select-none">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.colorHex }} />
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">{col.label}</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-white text-gray-400 border border-gray-250 py-0.5 px-2 rounded-full shadow-3xs">
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Column Card list items */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[140px] pr-0.5">
                      {columnTasks.length === 0 ? (
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-[#FFFFFF]/40 text-center text-xs text-gray-400 italic">
                          <p>No tasks yet.</p>
                          <button
                            onClick={() => onOpenQuickAdd(col.key, project.id)}
                            className="mt-2 text-[#378ADD] hover:underline hover:text-[#185FA5] font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          >
                            <Plus className="h-3 w-3" /> Add one
                          </button>
                        </div>
                      ) : (
                        columnTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onClick={onOpenTask}
                          />
                        ))
                      )}
                    </div>

                    {/* Column Quick Inline add Bottom */}
                    <button
                      onClick={() => onOpenQuickAdd(col.key, project.id)}
                      className="mt-2.5 w-full py-2 border border-dashed border-gray-250 hover:border-[#378ADD] bg-stone-50/50 hover:bg-[#FFFFFF] text-gray-500 hover:text-[#378ADD] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all select-none shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add new task</span>
                    </button>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          
          /* VIEW 2: FILTERABLE SORTABLE PROJECT LIST VIEW */
          <div className="bg-[#FFFFFF] border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            
            {/* Bulk selections bar triggers */}
            {bulkSelectedIds.length > 0 && (
              <div className="bg-blue-50/40 border-b border-blue-100/60 p-3 px-4 flex flex-wrap items-center justify-between gap-3 select-none text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#378ADD] animate-pulse" />
                  <span className="font-bold text-gray-800">{bulkSelectedIds.length} tasks selected</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status switches bulk trigger */}
                  <select
                    onChange={(e) => handleBulkMoveStatus(e.target.value as TaskStatus)}
                    defaultValue=""
                    className="bg-white border border-gray-200/80 rounded px-2.5 py-1 text-xs cursor-pointer focus:outline-hidden"
                  >
                    <option value="" disabled>Move to status...</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>

                  <button
                    onClick={handleBulkUnassign}
                    className="px-3 py-1 bg-white hover:bg-gray-55 border border-gray-200 text-gray-700 font-semibold rounded cursor-pointer transition-colors"
                  >
                    Unassign Users
                  </button>

                  <button
                    onClick={handleBulkDelete}
                    className="p-1 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-semibold rounded cursor-pointer transition-colors flex items-center gap-1"
                    title="Bulk Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => setBulkSelectedIds([])}
                    className="text-gray-400 hover:text-gray-650 cursor-pointer text-xs px-2"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* List Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs align-middle">
                <thead className="bg-gray-50 border-b border-gray-200 select-none text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={sortedTasks.length > 0 && bulkSelectedIds.length === sortedTasks.length}
                        onChange={handleToggleAllBulkSelect}
                        className="cursor-pointer h-4 w-4 rounded border-gray-300 text-[#378ADD] focus:ring-0"
                      />
                    </th>
                    <th className="p-4 w-16">ID</th>
                    <th className="p-4 min-w-[200px] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSortToggle('title')}>
                      <div className="flex items-center gap-1">
                        <span>Task Title</span>
                        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      </div>
                    </th>
                    <th className="p-4 w-32 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSortToggle('priority')}>
                      <div className="flex items-center gap-1">
                        <span>Priority</span>
                        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      </div>
                    </th>
                    <th className="p-4 w-40">Status</th>
                    <th className="p-4 w-36">Assignee</th>
                    <th className="p-4 w-28 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSortToggle('dueDate')}>
                      <div className="flex items-center gap-1">
                        <span>Due Date</span>
                        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 font-sans">
                  {sortedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400 italic">
                        No team tasks match safety or filters query conditions.
                      </td>
                    </tr>
                  ) : (
                    sortedTasks.map(t => {
                      const assignee = users.find(u => u.id === t.assigneeId);
                      const isChecked = bulkSelectedIds.includes(t.id);
                      
                      const priorityStyles = {
                        low: 'bg-stone-100 text-stone-700 border-stone-200',
                        normal: 'bg-blue-50 text-blue-800 border-blue-200',
                        high: 'bg-amber-50 text-amber-800 border-amber-200',
                        urgent: 'bg-rose-50 text-rose-800 border-rose-200'
                      }[t.priority];

                      return (
                        <tr 
                          key={t.id}
                          className={`hover:bg-slate-50 transition-colors ${isChecked ? 'bg-blue-50/10' : ''}`}
                        >
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleBulkSelect(t.id)}
                              className="cursor-pointer h-4 w-4 rounded border-gray-300 text-[#378ADD] focus:ring-0"
                            />
                          </td>

                          <td className="p-4 font-mono font-semibold text-gray-400">
                            {t.id}
                          </td>

                          <td className="p-4 min-w-[200px]">
                            <button
                              onClick={() => onOpenTask(t.id)}
                              className="font-semibold text-gray-900 hover:text-[#378ADD] text-left cursor-pointer transition-colors"
                            >
                              {t.title}
                            </button>
                            {t.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {t.labels.map(tag => (
                                  <span key={tag} className="text-[10px] bg-slate-100 text-stone-500 px-1 py-0.2 rounded-sm font-medium">#{tag}</span>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <span className={`text-[10px] tracking-wider uppercase font-semibold border px-2 py-0.5 rounded-full ${priorityStyles}`}>
                              {t.priority}
                            </span>
                          </td>

                          <td className="p-4">
                            <select
                              value={t.status}
                              onChange={(e) => {
                                updateTask({ ...t, status: e.target.value as TaskStatus });
                                showToast(`Task updated`, 'success');
                              }}
                              className="bg-stone-50 border border-gray-200 rounded px-2 py-1 text-xs cursor-pointer focus:outline-hidden"
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="in_review">In Review</option>
                              <option value="done">Done</option>
                            </select>
                          </td>

                          <td className="p-4">
                            {assignee ? (
                              <div className="flex items-center gap-1.5">
                                <div 
                                  className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: assignee.color }}
                                >
                                  {assignee.initials}
                                </div>
                                <span className="font-semibold text-gray-700 truncate">{assignee.name.split(' ')[0]}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="p-4 font-medium text-gray-500">
                            {t.dueDate ? t.dueDate : '—'}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        )}

      </div>

    </div>
  );
};
