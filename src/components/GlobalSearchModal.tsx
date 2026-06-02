/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Folder, CheckSquare, User as UserIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTask: (id: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onOpenTask
}) => {
  const { tasks, projects, users } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter lists
  const needle = query.trim().toLowerCase();
  
  const matchedTasks = needle
    ? tasks.filter(t => t.title.toLowerCase().includes(needle) || (t.description && t.description.toLowerCase().includes(needle)))
    : [];

  const matchedProjects = needle
    ? projects.filter(p => p.name.toLowerCase().includes(needle))
    : [];

  const matchedUsers = needle
    ? users.filter(u => u.name.toLowerCase().includes(needle) || u.role.toLowerCase().includes(needle))
    : [];

  const totalMatches = matchedTasks.length + matchedProjects.length + matchedUsers.length;

  const handleTaskClick = (id: string) => {
    onClose();
    onOpenTask(id);
  };

  const handleProjectClick = (id: string) => {
    onClose();
    navigate(`/projects/${id}`);
  };

  const handleViewAllResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24 px-4 backdrop-blur-xs">
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-[#FFFFFF] border border-gray-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[480px]"
        >
          {/* Search form box */}
          <form onSubmit={handleViewAllResults} className="flex items-center gap-3 px-4 py-3 border-b border-gray-150">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tasks, projects, people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 border-none focus:outline-hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600 rounded cursor-pointer p-0.5 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 rounded border border-gray-250 py-0.5 px-1.5 select-none">
              ESC
            </span>
          </form>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!query ? (
              <div className="py-8 text-center text-gray-400 space-y-1">
                <p className="text-sm font-medium">Global Search Interface</p>
                <p className="text-xs">Type to begin searching tasks, projects, or team members</p>
              </div>
            ) : totalMatches === 0 ? (
              <div className="py-8 text-center text-gray-400 space-y-1">
                <p className="text-sm font-medium">No results found for "{query}"</p>
                <p className="text-xs">Check syntax typos or search queries and try again</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Matching Tasks */}
                {matchedTasks.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                      Tasks ({matchedTasks.length})
                    </h4>
                    <div className="space-y-1">
                      {matchedTasks.slice(0, 5).map(t => (
                        <div
                          key={t.id}
                          onClick={() => handleTaskClick(t.id)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 cursor-pointer group text-xs text-gray-700 transition-colors"
                        >
                          <CheckSquare className="h-4 w-4 text-gray-400 group-hover:text-[#378ADD] shrink-0" />
                          <div className="flex-1 truncate">
                            <span className="font-semibold text-gray-900 group-hover:text-[#378ADD] block truncate">
                              {t.title}
                            </span>
                            {t.description && (
                              <span className="text-[11px] text-gray-400 block truncate leading-none">
                                {t.description}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase py-0.5 px-1 bg-gray-100 rounded text-gray-500">
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Projects */}
                {matchedProjects.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                      Projects ({matchedProjects.length})
                    </h4>
                    <div className="space-y-1">
                      {matchedProjects.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleProjectClick(p.id)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50/20 cursor-pointer group text-xs text-gray-700 transition-colors"
                        >
                          <Folder className="h-4 w-4 text-gray-400 group-hover:text-[#378ADD] shrink-0" style={{ color: p.color }} />
                          <span className="font-semibold text-gray-900 group-hover:text-[#378ADD] flex-1 truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Project ID: {p.id}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Users */}
                {matchedUsers.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                      Team Members ({matchedUsers.length})
                    </h4>
                    <div className="space-y-1">
                      {matchedUsers.map(u => (
                        <div
                          key={u.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-xs text-gray-700 select-none"
                        >
                          <div
                            className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: u.color }}
                          >
                            {u.initials}
                          </div>
                          <div className="flex-1 truncate">
                            <span className="font-semibold text-gray-900 block truncate">
                              {u.name}
                            </span>
                            <span className="text-[10px] text-gray-400 block truncate leading-none">
                              {u.role}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer bar */}
          {query && totalMatches > 0 && (
            <div className="px-4 py-2 border-t border-gray-150 bg-gray-55/7 bg-slate-50 flex justify-between items-center text-[10px] text-gray-400 font-medium">
              <span>Found {totalMatches} match{totalMatches === 1 ? '' : 'es'}</span>
              <button
                type="submit"
                onClick={handleViewAllResults}
                className="text-[#378ADD] hover:underline cursor-pointer"
              >
                Press Enter to view all results page &rarr;
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
