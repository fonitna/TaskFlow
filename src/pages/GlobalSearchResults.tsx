/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, Info, SlidersHorizontal, ArrowRight, User, CheckSquare, X, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';
import { TaskPriority, TaskStatus } from '../types';

interface GlobalSearchResultsProps {
  onOpenTask: (id: string) => void;
}

export const GlobalSearchResults: React.FC<GlobalSearchResultsProps> = ({ onOpenTask }) => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { tasks, projects, users, showToast } = useApp();

  // URL query parameter
  const searchKeyword = useMemo(() => {
    return new URLSearchParams(search).get('q') || '';
  }, [search]);

  // Faceted filters
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeIdFilter, setAssigneeIdFilter] = useState('');

  const [inputVal, setInputVal] = useState(searchKeyword);

  // Sync entry query
  React.useEffect(() => {
    setInputVal(searchKeyword);
  }, [searchKeyword]);

  // Execute keyword submissions
  const handleKeywordSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`/search`);
    }
  };

  const handleClearFacetedFilters = () => {
    setProjectIdFilter('');
    setPriorityFilter('');
    setStatusFilter('');
    setAssigneeIdFilter('');
    showToast('Faceted search reset', 'info');
  };

  const matches = useMemo(() => {
    return tasks.filter(t => {
      // Free Keyword matcher
      const matchesKeyword = searchKeyword === '' || 
        t.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchesProj = !projectIdFilter || t.projectId === projectIdFilter;
      const matchesPriority = !priorityFilter || t.priority === priorityFilter;
      const matchesStatus = !statusFilter || t.status === statusFilter;
      const matchesAssignee = !assigneeIdFilter || t.assigneeId === assigneeIdFilter;

      return matchesKeyword && matchesProj && matchesPriority && matchesStatus && matchesAssignee;
    });
  }, [tasks, searchKeyword, projectIdFilter, priorityFilter, statusFilter, assigneeIdFilter]);

  const hasFacetedFilter = projectIdFilter || priorityFilter || statusFilter || assigneeIdFilter;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex flex-col min-h-0"
    >
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-gray-400" />
          Faceted Search Engine
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Perform indexed fuzzy searches across descriptions, tags, and parameters.
        </p>
      </div>

      {/* Main Bar Search Form */}
      <form onSubmit={handleKeywordSearchSubmit} className="flex gap-2 bg-[#FFFFFF] p-3 rounded-xl border border-gray-200 shadow-3xs max-w-xl">
        <input
          type="text"
          placeholder="Type keyword and click Search (or press Enter)..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-transparent border-none focus:outline-hidden text-sm px-2 text-gray-900"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#378ADD] hover:bg-[#185FA5] text-xs font-semibold text-white rounded-lg cursor-pointer transition-colors"
        >
          Search
        </button>
      </form>

      {/* Grid: Left facets filter side panel (4-col), Right matches rows lists (8-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Facets Navigation selectors (4 col) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-gray-200 rounded-xl p-5 space-y-5 shadow-3xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              Faceted Filters
            </h3>
            {hasFacetedFilter && (
              <button 
                onClick={handleClearFacetedFilters}
                className="text-[11px] text-[#E24B4A] hover:underline font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs font-medium">
            
            {/* Project dropdown selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project</label>
              <select
                value={projectIdFilter}
                onChange={(e) => setProjectIdFilter(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-gray-250 hover:border-gray-300 rounded-lg px-2.5 py-1.8 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Status Selector dropdown */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-gray-250 hover:border-gray-300 rounded-lg px-2.5 py-1.8 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-gray-255 hover:border-gray-300 rounded-lg px-2.5 py-1.8 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignees Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assignee</label>
              <select
                value={assigneeIdFilter}
                onChange={(e) => setAssigneeIdFilter(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-gray-250 hover:border-gray-300 rounded-lg px-2.5 py-1.8 text-xs focus:outline-hidden cursor-pointer"
              >
                <option value="">All Members</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Search match listings results (8 col) */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-gray-200 rounded-xl overflow-hidden shadow-3xs flex flex-col">
          
          <div className="p-4 bg-gray-50 border-b border-gray-150 flex justify-between items-center text-xs font-bold text-gray-700">
            <span>Matches Inventory</span>
            <span className="bg-[#B5D4F4]/40 text-[#185FA5] px-2 py-0.5 rounded font-mono font-medium text-[10px]">
              {matches.length} task{matches.length === 1 ? '' : 's'} found
            </span>
          </div>

          <div className="divide-y divide-gray-100 divide-dashed">
            {matches.length === 0 ? (
              <div className="p-16 text-center text-gray-450 space-y-4">
                <HardDrive className="mx-auto h-12 w-12 text-gray-200" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-800">No tasks match your filters</p>
                  <p className="text-xs text-gray-400">Try adjusting your faceted parameters or change keywords syntaxes.</p>
                </div>
              </div>
            ) : (
              matches.map(t => {
                const proj = projects.find(p => p.id === t.projectId);
                const assNode = users.find(u => u.id === t.assigneeId);
                
                const getPriorityColor = (p: TaskPriority) => {
                  switch(p){
                    case 'low': return 'text-slate-500 bg-slate-100';
                    case 'normal': return 'text-blue-600 bg-blue-50';
                    case 'high': return 'text-amber-600 bg-amber-50';
                    case 'urgent': return 'text-rose-600 bg-rose-50';
                  }
                };

                return (
                  <div
                    key={t.id}
                    onClick={() => onOpenTask(t.id)}
                    className="p-5 flex items-start justify-between hover:bg-slate-50 cursor-pointer group transition-colors gap-3.5 text-xs text-gray-700"
                  >
                    <div className="space-y-1.5 truncate pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-gray-400">{t.id}</span>
                        {proj && (
                          <span 
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                            style={{ backgroundColor: `${proj.color}15`, color: proj.color }}
                          >
                            {proj.name}
                          </span>
                        )}
                        <span className={`text-[9px] uppercase tracking-wider font-semibold border border-transparent rounded px-1.5 py-0 rounded ${getPriorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>

                      <span className="font-semibold text-[13px] text-gray-900 group-hover:text-[#378ADD] block truncate leading-tight">
                        {t.title}
                      </span>

                      {t.description && (
                        <p className="text-xs text-gray-500 truncate leading-none pt-0.5">
                          {t.description}
                        </p>
                      )}

                      {t.labels && t.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {t.labels.map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-50/80 text-gray-400 px-1 py-0 rounded font-medium">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0 mt-1">
                      {/* Assignee Circle */}
                      {assNode ? (
                        <div 
                          className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border border-white shrink-0"
                          style={{ backgroundColor: assNode.color }}
                          title={assNode.name}
                        >
                          {assNode.initials}
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[10px] shrink-0 font-medium">
                          —
                        </div>
                      )}

                      <span className="text-[10px] font-mono leading-none border border-gray-200 bg-gray-50 text-gray-500 py-1 px-2 rounded-sm uppercase tracking-wide">
                        {t.status.replace('_', ' ')}
                      </span>

                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#378ADD] shrink-0 transform group-hover:translate-x-0.5 transition-all" />
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </motion.div>
  );
};
