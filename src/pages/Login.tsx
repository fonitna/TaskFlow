/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Users, UserPlus, Lock, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { users, setCurrentUser, registerUser } = useApp();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Registration States
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('Developer');
  const [regColor, setRegColor] = useState('#378ADD');
  
  // Selection States
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [errorText, setErrorText] = useState('');
  
  const rolePresets = ['Product Manager', 'Developer', 'Designer', 'QA Specialist', 'Content Writer', 'Team Lead'];
  const colorPresets = ['#378ADD', '#1D9E75', '#D4537E', '#BA7517', '#533AB7', '#639922', '#E24B4A'];

  const handleQuickSignIn = (userId: string) => {
    setSelectedUserId(userId);
    setPinCode('');
    setErrorText('');
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorText('Please select a profile to sign in.');
      return;
    }

    const matched = users.find(u => u.id === selectedUserId);
    if (!matched) {
      setErrorText('Selected user was not found.');
      return;
    }

    // Accept any 4-digit PIN, or empty PIN for friendly demo convenience
    if (pinCode.trim() && pinCode.trim().length < 4) {
      setErrorText('PIN code must be at least 4 digits.');
      return;
    }

    // Success login
    setCurrentUser(matched);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = regName.trim();
    if (!trimmed || trimmed.length < 2) {
      setErrorText('Display Name must be at least 2 characters.');
      return;
    }

    setErrorText('');
    const createdUser = registerUser(trimmed, regRole, regColor);
    if (createdUser) {
      // Already logged in inside registerUser context helper
    }
  };

  // Preview Initials generator
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .slice(0, 3)
      .join('')
      .toUpperCase() || 'UN';
  };

  return (
    <div className="min-h-screen bg-[#F1EFE8] flex flex-col justify-center items-center p-6 select-none leading-none antialiased text-slate-800">
      
      {/* Upper Brand Badge */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-8"
      >
        <div className="h-10 w-10 rounded-xl bg-[#378ADD] flex items-center justify-center text-white shadow-xl shadow-blue-500/10">
          <Sparkles className="h-5.5 w-5.5" />
        </div>
        <div className="text-left">
          <span className="text-xl font-extrabold tracking-tight block text-slate-900">
            Task<span className="text-[#378ADD]">Flow</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400">
            Enterprise Workspace v1.2
          </span>
        </div>
      </motion.div>

      {/* Login Frame Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md bg-white rounded-2xl border border-[#E5E2D9] shadow-xl overflow-hidden"
      >
        {/* Tab Switch header */}
        <div className="flex border-b border-[#E5E2D9] bg-[#FAF9F6]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorText('');
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'signin'
                ? 'border-[#378ADD] text-slate-900 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-600 bg-transparent'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Sign In</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorText('');
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-[#378ADD] text-slate-900 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-600 bg-transparent'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Join Team</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          
          {errorText && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-600 rounded-lg flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-rose-500 rounded-full shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {activeTab === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Select Active Workspace Professional
                </label>
                
                {/* Scrollable list of profiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {users.map(u => {
                    const isSelected = selectedUserId === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickSignIn(u.id)}
                        className={`p-3 text-left border rounded-xl flex items-center gap-2.5 transition-all outline-hidden cursor-pointer ${
                          isSelected
                            ? 'border-[#378ADD] bg-blue-50/10 ring-1 ring-[#378ADD]'
                            : 'border-[#E5E2D9] hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/5 shadow-2xs"
                          style={{ backgroundColor: u.color }}
                        >
                          {isSelected ? <Check className="h-4 w-4" /> : u.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold truncate leading-none ${isSelected ? 'text-[#378ADD]' : 'text-slate-800'}`}>
                            {u.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono capitalize tracking-tight mt-1 truncate">
                            {u.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedUserId && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-3 border-t border-[#E5E2D9]/60"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <label htmlFor="pin-code-input">Workspace Passcode (PIN)</label>
                      <span className="text-[10px] italic font-medium lowercase text-slate-400">
                        Default: empty or any digits
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
                      <input
                        id="pin-code-input"
                        type="password"
                        placeholder="••••"
                        maxLength={6}
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] text-slate-800 font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#378ADD] hover:bg-[#185FA5] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <span>Proceed to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {!selectedUserId && (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  Select your profile above to begin work
                </div>
              )}

            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Professional Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Supaporn S."
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  maxLength={25}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] text-slate-800"
                  required
                />
              </div>

              {/* Roles Dropdown Select */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Workspace Role / Title
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] text-slate-800 cursor-pointer"
                >
                  {rolePresets.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Colors Picker Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Initials Avatar Theme Accent
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {colorPresets.map(color => {
                    const isPicked = regColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setRegColor(color)}
                        className={`h-7 w-7 rounded-lg relative cursor-pointer transition-all flex items-center justify-center shrink-0 ${
                          isPicked
                            ? 'scale-110 shadow-md ring-2 ring-slate-200 border-2 border-white'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {isPicked && <Check className="h-3 w-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview Box Row */}
              {regName.trim().length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-slate-50 border border-[#E5E2D9]/70 rounded-xl flex items-center gap-3 mt-4"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold border border-white/10"
                    style={{ backgroundColor: regColor }}
                  >
                    {getInitials(regName)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{regName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{regRole}</p>
                  </div>
                </motion.div>
              )}

              {/* Action Button submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1D9E75] hover:bg-[#168260] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-[0.98] transition-all pt-2.5"
              >
                <span>Complete Onboarding & Enter</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </form>
          )}

        </div>
      </motion.div>

      {/* Trust Badge Footer */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium tracking-wide uppercase font-mono"
      >
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Secured Session Storage Authorized Portal</span>
      </motion.p>

    </div>
  );
};
