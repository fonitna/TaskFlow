import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api, ApiUser } from '../lib/api';
import { Sparkles, Users, UserPlus, Lock, ArrowRight, ShieldCheck, Check, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { loginUser, registerUser } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign-in state
  const [userList, setUserList] = useState<ApiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Developer');
  const [regColor, setRegColor] = useState('#378ADD');

  const rolePresets = ['Product Manager', 'Developer', 'Designer', 'QA Specialist', 'Content Writer', 'Team Lead'];
  const colorPresets = ['#378ADD', '#1D9E75', '#D4537E', '#BA7517', '#533AB7', '#639922', '#E24B4A'];

  // Load users for the card picker (public endpoint — no token needed)
  useEffect(() => {
    api.getUsers().then(res => setUserList(res.users)).catch(() => {});
  }, []);

  const handleCardClick = (user: ApiUser) => {
    setSelectedUser(user);
    setPassword('');
    setErrorText('');
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) { setErrorText('Please select a profile to sign in.'); return; }
    if (!password) { setErrorText('Password is required.'); return; }
    setIsSubmitting(true);
    setErrorText('');
    try {
      await loginUser(selectedUser.email, password);
    } catch (err: unknown) {
      setErrorText(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regName.trim().length < 2) { setErrorText('Name must be at least 2 characters.'); return; }
    if (!regEmail.trim().includes('@')) { setErrorText('Enter a valid email address.'); return; }
    if (regPassword.length < 6) { setErrorText('Password must be at least 6 characters.'); return; }
    setIsSubmitting(true);
    setErrorText('');
    try {
      await registerUser(regName.trim(), regEmail.trim().toLowerCase(), regPassword, regRole, regColor);
    } catch (err: unknown) {
      setErrorText(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (fullName: string) =>
    fullName.split(' ').map(n => n[0]).slice(0, 3).join('').toUpperCase() || 'UN';

  return (
    <div className="min-h-screen bg-[#F1EFE8] flex flex-col justify-center items-center p-6 select-none leading-none antialiased text-slate-800">

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

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md bg-white rounded-2xl border border-[#E5E2D9] shadow-xl overflow-hidden"
      >
        {/* Tab header */}
        <div className="flex border-b border-[#E5E2D9] bg-[#FAF9F6]">
          {(['signin', 'register'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setErrorText(''); }}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-[#378ADD] text-slate-900 bg-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'signin' ? <Users className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              <span>{tab === 'signin' ? 'Sign In' : 'Join Team'}</span>
            </button>
          ))}
        </div>

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
                  Select Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {userList.map(u => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleCardClick(u)}
                        className={`p-3 text-left border rounded-xl flex items-center gap-2.5 transition-all outline-hidden cursor-pointer ${
                          isSelected
                            ? 'border-[#378ADD] bg-blue-50/10 ring-1 ring-[#378ADD]'
                            : 'border-[#E5E2D9] hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
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

              {selectedUser && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-3 border-t border-[#E5E2D9]/60"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <Mail className="h-3 w-3" />
                      <span className="font-mono normal-case text-[10px]">{selectedUser.email}</span>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] text-slate-800"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#378ADD] hover:bg-[#185FA5] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Proceed to Dashboard</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {!selectedUser && (
                <p className="py-4 text-center text-xs text-slate-400 italic">
                  Select your profile above to begin
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Professional Name</label>
                <input
                  type="text" placeholder="e.g. Supaporn S." value={regName}
                  onChange={e => setRegName(e.target.value)} maxLength={25}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email" placeholder="you@example.com" value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] text-slate-800"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} placeholder="Min 6 characters"
                    value={regPassword} onChange={e => setRegPassword(e.target.value)} minLength={6}
                    className="w-full px-3.5 pr-10 py-2.5 text-sm bg-white border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] text-slate-800"
                    required
                  />
                  <button
                    type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</label>
                <select
                  value={regRole} onChange={e => setRegRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#378ADD] text-slate-800 cursor-pointer"
                >
                  {rolePresets.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avatar Color</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {colorPresets.map(color => (
                    <button
                      key={color} type="button" onClick={() => setRegColor(color)}
                      className={`h-7 w-7 rounded-lg relative cursor-pointer transition-all flex items-center justify-center shrink-0 ${
                        regColor === color ? 'scale-110 shadow-md ring-2 ring-slate-200 border-2 border-white' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {regColor === color && <Check className="h-3 w-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {regName.trim().length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-slate-50 border border-[#E5E2D9]/70 rounded-xl flex items-center gap-3"
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

              <button
                type="submit" disabled={isSubmitting}
                className="w-full py-2.5 bg-[#1D9E75] hover:bg-[#168260] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Onboarding &amp; Enter</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 flex items-center gap-1.5 text-[10px] text-slate-400 font-medium tracking-wide uppercase font-mono"
      >
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>JWT-secured · SQLite backend · TaskFlow v1.2</span>
      </motion.p>
    </div>
  );
};
