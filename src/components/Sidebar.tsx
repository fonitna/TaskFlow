/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Search, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Plus,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onOpenQuickAdd: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  onOpenQuickAdd
}) => {
  const { projects, tasks } = useApp();

  const getActiveTasksCount = (projId: string) => {
    return tasks.filter(t => t.projectId === projId && t.status !== 'done').length;
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'All Projects', icon: FolderKanban },
    { to: '/search', label: 'Faceted Search', icon: Search },
    { to: '/profile', label: 'User Profile', icon: UserIcon },
    { to: '/settings', label: 'Global Settings', icon: SettingsIcon },
  ];

  const sidebarClasses = `
    fixed md:sticky top-0 left-0 bottom-0 z-30
    h-screen bg-white text-slate-700 border-r border-[#E5E2D9]
    flex flex-col select-none transition-all duration-300
    ${isCollapsed ? 'w-12 md:w-12' : 'w-[240px] md:w-[240px]'}
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    /* Bottom bar replaces for tiny mobile */
    hidden xs:flex
  `;

  return (
    <>
      {/* Mobile Drawer Backdrop if open */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/10 z-20 md:hidden"
        />
      )}

      <aside className={sidebarClasses}>
        {/* Upper Sidebar Brand heading */}
        <div className="h-14 p-3 border-b border-[#E5E2D9] flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-1.5 focus:outline-hidden" onClick={() => setIsMobileOpen(false)}>
            <div className="h-8 w-8 rounded-lg bg-[#378ADD] flex items-center justify-center text-white shadow-md shadow-blue-500/15 shrink-0">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-slate-800 tracking-tight text-[16px]">
                Task<span className="text-[#378ADD] font-bold">Flow</span>
              </span>
            )}
          </NavLink>

          {/* Desktop Collapse Trigger */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation lists */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-2.5 py-2 text-sm rounded-lg hover:bg-slate-100 hover:text-slate-800 cursor-pointer transition-all
                    ${isActive ? 'bg-[#B5D4F4]/30 text-[#378ADD] font-semibold hover:bg-[#B5D4F4]/40' : 'text-slate-600'}
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={item.label}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Collapsible Section: My Projects List */}
          {!isCollapsed && (
            <div className="space-y-2 px-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2.5">
                <span>Projects</span>
                <NavLink to="/settings" className="hover:text-[#378ADD] cursor-pointer">
                  <Plus className="h-3 w-3" />
                </NavLink>
              </div>

              <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
                {projects.map(proj => {
                  const unresolvedCount = getActiveTasksCount(proj.id);
                  return (
                    <NavLink
                      key={proj.id}
                      to={`/projects/${proj.id}`}
                      className={({ isActive }) => `
                        flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-55 hover:text-slate-800 cursor-pointer transition-all
                        ${isActive ? 'bg-slate-100/80 text-[#378ADD] font-semibold border-l-2 border-[#378ADD]' : 'text-slate-500'}
                      `}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                        <span className="truncate">{proj.name}</span>
                      </div>
                      
                      {unresolvedCount > 0 && (
                        <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 border border-[#E5E2D9] rounded px-1.5 py-0.2 shrink-0">
                          {unresolvedCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer space */}
        {!isCollapsed ? (
          <div className="p-4 border-t border-[#E5E2D9] text-[10px] text-slate-400 font-mono">
            V 1.0.26-BETA
          </div>
        ) : (
          <div className="p-2 border-t border-[#E5E2D9] text-[9px] text-center text-slate-400 font-mono">
            v1.0
          </div>
        )}
      </aside>
    </>
  );
};
