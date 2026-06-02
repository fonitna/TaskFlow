/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, BellOff, Bookmark, Save, Sparkles, Shield, MapPin, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export const Profile: React.FC = () => {
  const { users, currentUser, updateCurrentUser, logoutUser, showToast } = useApp();

  if (!currentUser) return null;

  // Inputs
  const [name, setName] = useState(currentUser.name);
  const [initials, setInitials] = useState(currentUser.initials);
  const [color, setColor] = useState(currentUser.color);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const [notifyDaily, setNotifyDaily] = useState(true);

  // Avatar presets
  const avatarColors = ['#378ADD', '#1D9E75', '#D4537E', '#BA7517', '#533AB7', '#639922', '#E24B4A'];

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      showToast('Name must be 2 or more characters', 'error');
      return;
    }
    await updateCurrentUser({ name: trimmedName, color });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto"
    >
      
      {/* Page Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          User Settings & Team Details
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure profile metrics, initials colors, notifications, and review active collaborators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: Edit profile parameters (7 col) */}
        <form onSubmit={handleProfileSave} className="md:col-span-7 bg-[#FFFFFF] border border-gray-200 rounded-xl p-6 space-y-6 shadow-3xs">
          
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            {/* Visual Avatar preview */}
            <div 
              className="h-16 w-16 rounded-xl text-white text-xl font-bold flex items-center justify-center shadow-md border-2 border-white select-none shrink-0"
              style={{ backgroundColor: color }}
            >
              {initials || '??'}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-1.5">
                {currentUser.name}
              </h3>
              <span className="text-xs text-gray-400 capitalize bg-stone-100 border border-gray-250 py-0.5 px-2 rounded-full font-mono font-medium">
                {currentUser.role} (Workspace Host)
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {/* Edit names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-gray-600 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-[#378ADD]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-600 uppercase tracking-wider">Avatar Initials</label>
                <input
                  type="text"
                  value={initials}
                  onChange={(e) => setInitials(e.target.value)}
                  maxLength={3}
                  className="w-full bg-[#FFFFFF] border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 uppercase focus:outline-hidden focus:ring-1 focus:ring-[#378ADD]"
                  required
                />
              </div>
            </div>

            {/* Avatar color grid picker */}
            <div className="space-y-1.5">
              <label className="block text-gray-600 uppercase tracking-wider">Accent Theme Color</label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {avatarColors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-lg relative cursor-pointer flex items-center justify-center transition-all ${
                      color === c ? 'scale-110 shadow-md ring-2 ring-gray-150 border-2 border-white' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible checkboxes: notification settings */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <label className="block text-gray-650 font-bold uppercase tracking-wider">Delivery Channels preferences</label>
              
              <div className="space-y-2 text-xs font-medium text-gray-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="h-4 w-4 text-[#378ADD] rounded border-gray-300 focus:ring-0 cursor-pointer"
                  />
                  <span>Dispatch email digests on assigned tasks</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyPush}
                    onChange={(e) => setNotifyPush(e.target.checked)}
                    className="h-4 w-4 text-[#378ADD] rounded border-gray-300 focus:ring-0 cursor-pointer"
                  />
                  <span>Enable native system browser push triggers</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyDaily}
                    onChange={(e) => setNotifyDaily(e.target.checked)}
                    className="h-4 w-4 text-[#378ADD] rounded border-gray-300 focus:ring-0 cursor-pointer"
                  />
                  <span>Receive relative digest summaries daily at 8:00 AM</span>
                </label>
              </div>
            </div>

          </div>

          <div className="flex justify-between items-center pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={logoutUser}
              className="px-4 py-2 border border-rose-200 hover:bg-[#E24B4A]/5 text-[#E24B4A] text-xs font-extrabold rounded-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Session</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-[#378ADD] hover:bg-[#185FA5] text-xs font-bold text-white rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Profile Config</span>
            </button>
          </div>

        </form>

        {/* Right Card: Read-only Team directory roster (5 col) */}
        <div className="md:col-span-5 bg-[#FFFFFF] border border-gray-200 rounded-xl p-5 space-y-4 shadow-3xs">
          <div>
            <h3 className="text-xs font-bold text-gray-650 uppercase tracking-widest block mb-1">
              Co-worker Directory
            </h3>
            <p className="text-[11px] text-gray-400">Read-only personnel list belonging to TaskFlow workspace.</p>
          </div>

          <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
            {users.map(u => {
              const isActiveUser = u.id === currentUser.id;
              return (
                <div key={u.id} className="py-3 flex items-center gap-3 text-xs leading-tight">
                  <div
                    className="h-8 w-8 rounded-lg text-white font-bold flex items-center justify-center shrink-0 shadow-3xs border border-white"
                    style={{ backgroundColor: u.color }}
                  >
                    {u.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                      {u.name}
                      {isActiveUser && (
                        <span className="text-[9px] bg-blue-50 text-[#378ADD] border border-blue-200 rounded px-1 font-bold select-none leading-none">
                          YOU
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-450 mt-0.5">{u.role}</p>
                  </div>

                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-250 py-0.5 px-2 rounded-full">
                    {u.id}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Security Info indicators */}
          <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-450 leading-normal">
            <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Workspace roles authenticated via client memory modules.</span>
          </div>

        </div>

      </div>

    </motion.div>
  );
};
