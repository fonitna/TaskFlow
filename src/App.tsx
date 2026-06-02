/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/ToastContainer';
import { CreateTaskDrawer } from './components/CreateTaskDrawer';
import { TaskDetailModal } from './components/TaskDetailModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { ProjectsIndex } from './pages/ProjectsIndex';
import { ProjectDetail } from './pages/ProjectDetail';
import { GlobalSearchResults } from './pages/GlobalSearchResults';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

import { Sparkles, Menu, Home, FolderKanban, Search, User as UserIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

// Inner app routing wrapper to gain access to navigate hooks in Global Search
const AppContent: React.FC = () => {
  const { projects, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Responsive navigation bar states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Quick Global task creator drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTargetStatus, setDrawerTargetStatus] = useState<'todo' | 'in_progress' | 'in_review' | 'done'>('todo');
  const [drawerTargetProjId, setDrawerTargetProjId] = useState('');

  // Task Details Modal triggers
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Global Search Hotkeys overlay states
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard binding listener: ⌘K or Ctrl+K to trigger search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick Open triggers
  const handleOpenQuickAdd = (
    status: 'todo' | 'in_progress' | 'in_review' | 'done' = 'todo',
    projectId: string = ''
  ) => {
    setDrawerTargetStatus(status);
    setDrawerTargetProjId(projectId || (projects[0]?.id || ''));
    setIsDrawerOpen(true);
  };

  const handleOpenTask = (taskId: string) => {
    setActiveTaskId(taskId);
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-[#F1EFE8] text-stone-900 font-sans antialiased overflow-hidden select-none">
      
      {/* 1. Collapsible Responsive Left Sidebar (disappears on <= 480px, collapses on <= 768px) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenQuickAdd={() => handleOpenQuickAdd('todo')}
      />

      {/* 2. Main content block frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Header bar: search tools, profile switchers, alarm triggers */}
        <Header
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          onOpenGlobalSearch={() => setIsSearchOpen(true)}
        />

        {/* Dynamic Client Page Router view screen */}
        <main className="flex-1 overflow-y-auto pb-16 xs:pb-0 bg-stone-50/40">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  onOpenTask={handleOpenTask} 
                  onOpenQuickAdd={handleOpenQuickAdd} 
                />
              } 
            />
            <Route path="/projects" element={<ProjectsIndex />} />
            <Route 
              path="/projects/:projectId" 
              element={
                <ProjectDetail 
                  onOpenTask={handleOpenTask} 
                  onOpenQuickAdd={handleOpenQuickAdd} 
                />
              } 
            />
            <Route 
              path="/search" 
              element={<GlobalSearchResults onOpenTask={handleOpenTask} />} 
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* 3. Immersive Bottom Navigation Deck replacing items on super-small responsive displays (width <= 480px) */}
        <div className="xs:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#2C2C2A] border-t border-white/5 px-2 flex items-center justify-around z-20 shadow-lg">
          <NavLink
            to="/"
            className={({ isActive }) => `flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${isActive ? 'text-[#378ADD]' : 'text-stone-400 hover:text-white'}`}
          >
            <Home className="h-4.5 w-4.5" />
            <span className="text-[10px] font-medium mt-1">Home</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${isActive ? 'text-[#378ADD]' : 'text-stone-400 hover:text-white'}`}
          >
            <FolderKanban className="h-4.5 w-4.5" />
            <span className="text-[10px] font-medium mt-1">Boards</span>
          </NavLink>

          <button
            onClick={() => handleOpenQuickAdd('todo')}
            className="h-10 w-10 bg-[#378ADD] hover:bg-[#185FA5] text-white rounded-full flex items-center justify-center shadow-md -translate-y-2 relative border-4 border-[#2C2C2A] cursor-pointer"
            title="Create Task"
          >
            <Menu className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
          </button>

          <NavLink
            to="/search"
            className={({ isActive }) => `flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${isActive ? 'text-[#378ADD]' : 'text-stone-400 hover:text-white'}`}
          >
            <Search className="h-4.5 w-4.5" />
            <span className="text-[10px] font-medium mt-1">Search</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) => `flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${isActive ? 'text-[#378ADD]' : 'text-stone-400 hover:text-white'}`}
          >
            <UserIcon className="h-4.5 w-4.5" />
            <span className="text-[10px] font-medium mt-1">Profile</span>
          </NavLink>
        </div>

      </div>

      {/* 4. Core Sliding Create Task Drawer on the Right side */}
      <CreateTaskDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        initialStatus={drawerTargetStatus}
        initialProjectId={drawerTargetProjId}
      />

      {/* 5. Central Task Details discussion Modal overlay */}
      <TaskDetailModal
        taskId={activeTaskId}
        onClose={() => setActiveTaskId(null)}
      />

      {/* 6. Instant Fuzzy Query Hotkey Overlay popups (⌘K / Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenTask={handleOpenTask}
      />

      {/* 7. Persistent Alerts Toast Container widgets */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
