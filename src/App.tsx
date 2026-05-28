import React, { useState, useEffect } from 'react';
import { AudioProvider } from './context/AudioContext';
import { Dashboard } from './views/Dashboard';
import { PracticeMode } from './views/PracticeMode';
import { TestMode } from './views/TestMode';
import { ReferenceGuide } from './views/ReferenceGuide';
import { LayoutDashboard, GraduationCap, Compass, BookOpen, Volume2, Sparkles, Sun, Moon } from 'lucide-react';

type ViewType = 'dashboard' | 'practice' | 'test' | 'guide';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('practice'); // default to practice mode directly
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark'; // default to dark mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'practice':
        return <PracticeMode />;
      case 'test':
        return <TestMode />;
      case 'guide':
        return <ReferenceGuide />;
      default:
        return <PracticeMode />;
    }
  };

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'แดชบอร์ด / สถิติ', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice' as ViewType, label: 'โหมดฝึกซ้อม A/B', labelEn: 'Practice Mode', icon: Compass },
    { id: 'test' as ViewType, label: 'โหมดทดสอบหู', labelEn: 'Test Mode', icon: GraduationCap },
    { id: 'guide' as ViewType, label: 'คู่มือความถี่เสียง', labelEn: 'Reference Guide', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-800 dark:bg-[#07090e] dark:text-gray-200 relative overflow-hidden transition-colors duration-300">
      {/* Background neon light points */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/3 dark:bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

      {/* Navigation Sidebar (Desktop) / Top Bar (Mobile) */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#0a0c12]/90 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 flex flex-col justify-between shrink-0 z-20 transition-colors duration-300">
        <div>
          {/* Logo HUD */}
          <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-md font-bold text-slate-900 dark:text-white tracking-wide m-0 flex items-center gap-1">
                  ProEQ Trainer
                  <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 fill-violet-500 dark:fill-violet-400" />
                </h1>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 block uppercase font-mono tracking-widest mt-0.5">Ear Training Web</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`
                    w-full px-4 py-3 rounded-xl text-left text-xs font-bold transition flex items-center gap-3 cursor-pointer
                    ${isActive
                      ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/25 shadow-lg shadow-violet-500/5'
                      : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-gray-500'}`} />
                  <div className="flex flex-col">
                    <span className={isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-white/90'}>{item.label}</span>
                    <span className="text-[9px] text-slate-400 dark:text-gray-500 font-light mt-0.5">{item.labelEn}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Theme Toggler */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3">
          {/* Light/Dark Mode Switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {theme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>โหมดสว่าง (Light Mode)</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-violet-400" />
                  <span>โหมดมืด (Dark Mode)</span>
                </>
              )}
            </span>
            <span className="text-[9px] bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-gray-400 font-mono">
              Toggle
            </span>
          </button>

          <div className="text-center hidden md:block">
            <span className="text-[10px] text-slate-400 dark:text-gray-600 block">Pro EQ Ear Training App</span>
            <span className="text-[9px] text-slate-500 dark:text-gray-700 block font-mono mt-0.5">v1.0.0 (9arm Skills Activated)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 z-10">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
};

export default App;
