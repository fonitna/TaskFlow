/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Save, Folder, Check, Trash2, Columns, Users, AlertCircle, RefreshCw, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

export const Settings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { projects, users, updateProject, showToast, theme, toggleTheme } = useApp();

  const activeProjId = searchParams.get('project') || '';

  // Selected project state
  const [selectedProjId, setSelectedProjId] = useState(activeProjId || (projects[0]?.id || ''));

  const projectObj = useMemo(() => {
    return projects.find(p => p.id === selectedProjId);
  }, [projects, selectedProjId]);

  // Form Fields
  const [name, setName] = useState('');
  const [color, setColor] = useState('#378ADD');
  const [projMembers, setProjMembers] = useState<string[]>([]);
  const [errorText, setErrorText] = useState('');

  // Column management (local presets simulation)
  const [columnsList, setColumnsList] = useState<string[]>(['To Do', 'In Progress', 'In Review', 'Done']);
  const [newColumnVal, setNewColumnVal] = useState('');

  // Presets
  const colorPresets = ['#378ADD', '#1D9E75', '#D4537E', '#BA7517', '#533AB7', '#639922', '#E24B4A'];

  // Sync state when project changes
  useEffect(() => {
    if (projectObj) {
      setName(projectObj.name);
      setColor(projectObj.color);
      setProjMembers(projectObj.members);
    }
  }, [projectObj]);

  // Handle active query params
  useEffect(() => {
    if (activeProjId) {
      setSelectedProjId(activeProjId);
    }
  }, [activeProjId]);

  const handleProjChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProjId(val);
    setSearchParams({ project: val });
  };

  const handleMemberToggle = (userId: string) => {
    setProjMembers(prev => 
      prev.includes(userId) ? prev.filter(x => x !== userId) : [...prev, userId]
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectObj) return;

    const trimmedName = name.trim();

    // Check constraints: name length & uniqueness
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      setErrorText('Project name must be 3 to 50 characters.');
      return;
    }

    const isDuplicate = projects.some(p => p.id !== projectObj.id && p.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      setErrorText('Project name must be unique.');
      return;
    }

    // Assign members list: cannot be empty
    if (projMembers.length === 0) {
      setErrorText('Please select at least one project member.');
      return;
    }

    // Success
    updateProject(projectObj.id, trimmedName, color, projMembers);
    setErrorText('');
  };

  // Columns management helpers
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newColumnVal.trim();
    if (trimmed && !columnsList.includes(trimmed)) {
      setColumnsList([...columnsList, trimmed]);
      setNewColumnVal('');
      showToast(`Column "${trimmed}" added (Preview Only)`, 'success');
    }
  };

  const handleRemoveColumn = (col: string) => {
    setColumnsList(columnsList.filter(x => x !== col));
    showToast(`Column "${col}" removed (Preview Only)`, 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto"
    >
      
      {/* Title banner */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          Project Settings panel
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Edit project metadata, color coding, board column lists and assignees access checklists.
        </p>
      </div>

      {/* Workspace Visual Mode (Theme) card */}
      <div className="bg-[#FFFFFF] border border-gray-200 rounded-xl p-5 shadow-3xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            {theme === 'light' ? (
              <Sun className="h-4.5 w-4.5 text-amber-500" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-[#378ADD]" />
            )}
            <span>Workspace Theme Mode</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Switch between light and dark themes to optimize viewing comfort and focus.
          </p>
        </div>
        
        <div className="flex bg-stone-100 p-1 rounded-xl border border-[#E5E2D9]">
          <button
            type="button"
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              theme === 'light'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-stone-400 hover:text-stone-200 bg-transparent'
            }`}
          >
            <Sun className="h-4 w-4 shrink-0" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => theme === 'light' && toggleTheme()}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-all ${
              theme === 'dark'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-stone-400 hover:text-stone-700 bg-transparent'
            }`}
          >
            <Moon className="h-4 w-4 shrink-0" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-gray-250 p-8 rounded-xl text-center text-gray-450 italic">
          No projects available in this memory registry. Create a project to customize settings.
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Specific selector dropdown */}
          <div className="bg-[#FFFFFF] border border-gray-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
            <div className="space-y-1.5 flex-1 max-w-sm">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                Active Selected Project
              </label>
              <select
                value={selectedProjId}
                onChange={handleProjChange}
                className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-xs text-gray-850 focus:outline-hidden cursor-pointer font-semibold"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {projectObj && (
              <button
                onClick={() => navigate(`/projects/${projectObj.id}`)}
                className="px-4 py-2 border border-[#378ADD] text-xs font-bold rounded-lg text-[#378ADD] hover:bg-blue-50 transition-colors cursor-pointer select-none leading-none"
              >
                Go to project board &rarr;
              </button>
            )}
          </div>

          {projectObj && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form editing settings (7 col) */}
              <form onSubmit={handleSaveSettings} className="lg:col-span-8 bg-[#FFFFFF] border border-gray-200 rounded-xl p-6 space-y-6 shadow-3xs">
                
                <h3 className="text-xs font-bold text-gray-650 uppercase tracking-widest block border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Folder className="h-4 w-4 text-stone-400" />
                  Customize metadata
                </h3>

                <div className="space-y-4 text-xs font-semibold text-gray-700">
                  {/* Name field input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorText('');
                      }}
                      className="w-full border border-gray-250 hover:border-gray-300 focus:border-[#378ADD] rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#B5D4F4]"
                      maxLength={50}
                      required
                    />
                    {errorText && (
                      <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1 leading-none">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errorText}
                      </p>
                    )}
                  </div>

                  {/* Accents colour preset rows */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Accents Color presets</label>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {colorPresets.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`h-8 w-8 rounded-lg relative cursor-pointer flex items-center justify-center transition-all ${
                            color === c ? 'scale-110 shadow-md ring-2 ring-blue-100 border-2 border-white' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c }}
                        >
                          {color === c && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Team project member check fields */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-widest flex items-center gap-1">
                      <Users className="h-4 w-4 text-stone-400" />
                      Collaborators Checklist
                    </label>
                    <p className="text-[10px] text-gray-400 font-normal">Check who can participate or view tasks in this project.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs">
                      {users.map(u => {
                        const isSelected = projMembers.includes(u.id);
                        return (
                          <label 
                            key={u.id}
                            className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                              isSelected 
                                ? 'border-[#378ADD]/60 bg-blue-50/10' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleMemberToggle(u.id)}
                              className="h-4 w-4 text-[#378ADD] rounded border-gray-300 focus:ring-0 cursor-pointer"
                            />
                            <div 
                              className="h-6 w-6 rounded-md flex items-center justify-center text-white text-[9px] font-bold"
                              style={{ backgroundColor: u.color }}
                            >
                              {u.initials}
                            </div>
                            <div className="leading-tight">
                              <p className="font-semibold text-gray-800">{u.name}</p>
                              <p className="text-[10px] text-gray-400 font-normal">{u.role}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-5 border-t border-gray-100">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#378ADD] hover:bg-[#185FA5] text-xs font-bold text-white rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Project Config</span>
                  </button>
                </div>

              </form>

              {/* Column management sidebar panel (4 col) */}
              <div className="lg:col-span-4 bg-[#FFFFFF] border border-gray-200 rounded-xl p-5 space-y-4 shadow-3xs">
                
                <div>
                  <h3 className="text-xs font-bold text-gray-650 uppercase tracking-widest block mb-1 flex items-center gap-1">
                    <Columns className="h-4 w-4 text-stone-400" />
                    Column presets list
                  </h3>
                  <p className="text-[10px] text-gray-400">Configure status columns displayed inside the visual board grid.</p>
                </div>

                <form onSubmit={handleAddColumn} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Column name, e.g. Backlog"
                    value={newColumnVal}
                    onChange={(e) => setNewColumnVal(e.target.value)}
                    className="flex-1 border border-gray-250 hover:border-gray-300 focus:border-[#378ADD] rounded px-2 py-1.5 text-xs text-gray-800 focus:outline-hidden"
                    maxLength={30}
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gray-150 rounded cursor-pointer hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-1.5">
                  {columnsList.map(col => {
                    // Standard columns shouldn't be deleted easily
                    const isSystem = ['To Do', 'In Progress', 'In Review', 'Done'].includes(col);
                    return (
                      <div key={col} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold">
                        <span className="text-gray-800">{col}</span>
                        {!isSystem ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveColumn(col)}
                            className="text-stone-450 hover:text-red-500 cursor-pointer p-0.5 rounded hover:bg-gray-200"
                            title="Remove column"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest py-0.5 px-2 bg-white rounded border border-gray-250 select-none">
                            Lock
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Simulated database warning */}
                <div className="pt-4 border-t border-gray-100 flex items-start gap-1.5 text-[9px] text-gray-400 leading-normal">
                  <RefreshCw className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>Interactive column changes are simulated. Mock lists are globally locked.</span>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </motion.div>
  );
};
