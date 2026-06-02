/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Menu, Sparkles, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenGlobalSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenGlobalSearch
}) => {
  const { users, currentUser, setCurrentUser, logoutUser, showToast } = useApp();
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  if (!currentUser) return null;
  
  // Mock notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Jordan Lee assigned you to 'Redesign homepage hero section'", isNew: true },
    { id: 2, text: "Marc Rossi commented on 'Implement dark mode toggle'", isNew: true },
    { id: 3, text: "Website Redesign project board was updated", isNew: false }
  ]);

  const unreadCount = notifications.filter(n => n.isNew).length;

  const handleClearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    showToast("Clear notifications", "info");
    setShowNotificationMenu(false);
  };

  const handleSelectUser = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      showToast(`Switched active profile to ${selected.name}`, 'success');
    }
    setShowUserDropdown(false);
  };

  return (
    <header className="sticky top-0 right-0 z-20 h-14 bg-[#FFFFFF] border-b border-[#E5E2D9] px-4 md:px-6 flex items-center justify-between select-none shrink-0 shadow-xs">
      
      {/* Off-canvas Hamburger trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1 px-2.5 bg-gray-50 border border-[#E5E2D9] hover:bg-gray-150 rounded-lg text-gray-500 hover:text-gray-800 transition-colors md:hidden cursor-pointer flex items-center gap-1.5"
          title="Open Drawer Menu"
        >
          <Menu className="h-4.5 w-4.5" />
          <span className="text-xs font-semibold uppercase tracking-wider hidden xs:inline">Menu</span>
        </button>

        {/* Small Screen Brand Logo when sidebar offf-canvas hidden */}
        <div className="flex items-center gap-1.5 xs:hidden">
          <div className="h-7 w-7 rounded bg-[#378ADD] flex items-center justify-center text-white font-bold">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-gray-900">TaskFlow</span>
        </div>

        {/* Search trigger button mimic */}
        <button
          onClick={onOpenGlobalSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 bg-gray-55/7 bg-stone-100 hover:bg-stone-150 border border-[#E5E2D9] rounded-lg max-w-[260px] text-left group transition-all cursor-pointer"
        >
          <Search className="h-3.5 w-3.5 group-hover:text-gray-650 shrink-0 transition-colors" />
          <span className="truncate pr-4">Search keys, people, projects...</span>
          <span className="text-[10px] font-mono leading-none border border-[#E5E2D9] rounded px-1.5 py-0.5 ml-auto bg-white shadow-3xs flex shrink-0">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right nav bar controls */}
      <div className="flex items-center gap-3.5">
        
        {/* Search icon trigger for smaller screens */}
        <button
          onClick={onOpenGlobalSearch}
          className="p-2 bg-gray-100 text-gray-500 hover:bg-gray-150 rounded-lg md:hidden cursor-pointer"
          aria-label="Global Search"
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        {/* Notifications Popover Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowUserDropdown(false);
            }}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg relative cursor-pointer"
            aria-label="System notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotificationMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotificationMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-[#FFFFFF] border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
                >
                  <div className="p-3 bg-gray-50 border-b border-gray-200/80 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Recent Activity
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-[10px] text-[#378ADD] hover:underline font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        All notifications cleared
                      </div>
                    ) : (
                      notifications.map(item => (
                        <div key={item.id} className={`p-3 text-[11px] leading-relaxed relative ${item.isNew ? 'bg-blue-50/15' : ''}`}>
                          {item.isNew && (
                            <span className="absolute top-3.5 left-1 h-1.5 w-1.5 bg-[#378ADD] rounded-full" />
                          )}
                          <p className={`pl-2 ${item.isNew ? 'text-gray-90 \
                            text-stone-900 font-medium' : 'text-gray-500'}`}>
                            {item.text}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User switching profile bar widget */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-2 p-1 pl-2.5 bg-gray-55/7 bg-stone-50 hover:bg-stone-100 border border-gray-200 rounded-lg cursor-pointer transition-all focus:outline-hidden"
          >
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-semibold text-gray-800 leading-tight">
                {currentUser.name}
              </span>
              <span className="block text-[10px] text-gray-400 capitalize leading-none">
                {currentUser.role} (Observer)
              </span>
            </div>

            <div 
              className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold shadow-xs select-none"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.initials}
            </div>
            
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          </button>

          <AnimatePresence>
            {showUserDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
                >
                  <div className="p-3 bg-gray-55/7 bg-stone-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-150">
                    Switch Test Profile
                  </div>

                  <div className="p-1 divide-y divide-gray-100">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u.id)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2 text-xs rounded-lg hover:bg-stone-50 cursor-pointer transition-colors ${
                          u.id === currentUser.id ? 'bg-[#B5D4F4]/10 text-[#378ADD] font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <div
                          className="h-6 w-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: u.color }}
                        >
                          {u.initials}
                        </div>
                        <div className="truncate flex-1">
                          <p className="font-semibold leading-tight">{u.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{u.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-1.5 bg-rose-50/10 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logoutUser();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs text-[#E24B4A] hover:bg-rose-50/50 rounded-lg cursor-pointer font-bold transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-[#E24B4A] shrink-0" />
                      <span>Sign Out Session</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
};
