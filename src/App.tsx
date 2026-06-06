import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth } from './lib/auth';
import { WeakTopic, MockHistoryItem } from './types';
import Dashboard from './components/Dashboard';
import MockTest from './components/MockTest';
import GeneralAwareness from './components/GeneralAwareness';
import DescriptiveGrader from './components/DescriptiveGrader';
import CalendarScheduler from './components/CalendarScheduler';
import GoogleSignIn from './components/GoogleSignIn';
import { BookOpen, Calendar, HelpCircle, LayoutGrid, ShieldAlert, Sparkles, Trophy, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

function VisualProgressGraph({ history, onAddScore, onDeleteScore }: { 
  history: MockHistoryItem[];
  onAddScore: (score: number) => void;
  onDeleteScore: (id: string) => void;
}) {
  const [newScoreVal, setNewScoreVal] = useState<string>('');
  
  // Calculate SVG dimensions
  const width = 300;
  const height = 130;
  const paddingX = 35;
  const paddingY = 15;

  // Render score points
  let pathD = '';
  const points = history.map((item, index) => {
    const x = paddingX + (index / Math.max(1, history.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (item.score / 100) * (height - paddingY * 2);
    return { x, y, score: item.score, item };
  });

  if (points.length > 1) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  } else if (points.length === 1) {
    pathD = `M ${paddingX} ${points[0].y} L ${width - paddingX} ${points[0].y}`;
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sc = parseInt(newScoreVal);
    if (!isNaN(sc) && sc >= 0 && sc <= 100) {
      onAddScore(sc);
      setNewScoreVal('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5 font-sans transition-all duration-200" id="scores-progress-sidebar">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <Trophy size={14} className="text-indigo-650 dark:text-indigo-400 shrink-0" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-extrabold">Mock Progress Graph</span>
          </h4>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Score trends across mock exam sessions</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No mock exams recorded yet. Try a timed assessment!
        </div>
      ) : (
        <div className="relative pt-2">
          {/* Custom Crafted SVG graph */}
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
            {/* Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3,3" strokeWidth="1" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3,3" strokeWidth="1" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" />

            {/* Grid Labels */}
            <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" className="fill-gray-400 font-mono text-[9px] font-semibold">100%</text>
            <text x={paddingX - 8} y={height / 2 + 4} textAnchor="end" className="fill-gray-400 font-mono text-[9px] font-semibold">50%</text>
            <text x={paddingX - 8} y={height - paddingY + 4} textAnchor="end" className="fill-gray-400 font-mono text-[9px] font-semibold">0%</text>

            {/* Graph Path Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />
            )}

            {/* Filled area underneath path */}
            {points.length > 1 && (
              <path
                d={`${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
                fill="url(#mock-gradient)"
                opacity="0.1"
              />
            )}

            <defs>
              <linearGradient id="mock-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Points circles and labels */}
            {points.map((pt, i) => (
              <g key={i} className="group">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  className="fill-white stroke-indigo-600 cursor-pointer dark:stroke-indigo-400 stroke-[2.5px] hover:r-5 transition-all"
                  id={`graph-dot-${i}`}
                />
                {/* Score value floating text */}
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  textAnchor="middle"
                  className="fill-indigo-950 dark:fill-white font-mono text-[9px] font-bold"
                >
                  {pt.score}%
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* Progress History List */}
      <div className="space-y-2">
        <h5 className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">Score History</h5>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {history.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-950/80 hover:bg-slate-100/50 dark:hover:bg-gray-850 text-xs hover:scale-[1.01] duration-150 transition-all">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{record.label}</p>
                <span className="text-[9px] text-gray-400 dark:text-gray-400">{record.date}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`font-mono font-black border px-2 py-0.5 rounded-lg text-[10px] ${record.score >= 60 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900 text-red-800 dark:text-red-400'}`}>
                  {record.score}%
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteScore(record.id)}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 hover:bg-gray-150 dark:hover:bg-slate-800 p-1 rounded transition duration-150 cursor-pointer"
                  title="Delete Record"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Score Submission Block */}
      <form onSubmit={handleAddSubmit} className="pt-2 border-t border-gray-100 dark:border-slate-800 flex gap-2">
        <input
          type="number"
          min="0"
          max="100"
          required
          placeholder="New Score (0-100)%"
          value={newScoreVal}
          onChange={(e) => setNewScoreVal(e.target.value)}
          className="flex-grow text-xs border border-gray-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-indigo-500 bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer hover:scale-[1.01] active:scale-99"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<'DASHBOARD' | 'MOCK_TEST' | 'GENERAL_AWARENESS' | 'DESCRIPTIVE' | 'CALENDAR'>('DASHBOARD');

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Scores progress tracking list
  const [mockHistory, setMockHistory] = useState<MockHistoryItem[]>(() => {
    const saved = localStorage.getItem('mockHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', label: 'Diagnostic Test 1', score: 48, date: 'May 10, 2026' },
      { id: '2', label: 'Practice Mock 2', score: 54, date: 'May 17, 2026' },
      { id: '3', label: 'Sectional Test 3', score: 62, date: 'May 24, 2026' },
      { id: '4', label: 'Full PO Mock 4', score: 68, date: 'Jun 1, 2026' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('mockHistory', JSON.stringify(mockHistory));
  }, [mockHistory]);

  // Pre-selected subject for Calendar scheduling slot recommendation triggers
  const [preselectedSubject, setPreselectedSubject] = useState<string | null>(null);

  // Slim/Collapsible Navigation Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  // Diagnostic states
  const [scores, setScores] = useState<{ [key: string]: number }>({
    'Quantitative Aptitude': 0,
    'Reasoning Ability': 0,
    'English Language': 0,
    'General Awareness': 0,
    'Descriptive Writing': 0
  });

  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);

  // Initialize Auth listeners to support seamless restoration
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignInSuccess = (signedUser: User, signedToken: string) => {
    setUser(signedUser);
    setToken(signedToken);
  };

  const handleSignOut = () => {
    setUser(null);
    setToken(null);
  };

  // Callback to compute diagnostic feedback from Mock exams
  const handleTestComplete = (results: { scores: { [key: string]: number }; weakTopics: string[]; overallScore?: number }) => {
    setScores(prev => {
      const revised = { ...prev, ...results.scores };
      // Re-compile focus elements
      compileWeakTopicsList(revised);
      return revised;
    });

    // Compute or receive final score percentage
    let avgScore = results.overallScore;
    if (avgScore === undefined) {
      const validSubjects = ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'];
      let sum = 0;
      let count = 0;
      validSubjects.forEach(sub => {
        if (results.scores[sub] !== undefined) {
          sum += results.scores[sub];
          count++;
        }
      });
      avgScore = count > 0 ? Math.round(sum / count) : 0;
    }

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    setMockHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        label: `Mock Exam ${prev.length + 1}`,
        score: avgScore!,
        date: dateStr
      }
    ]);
  };

  // Callback to compute diagnostic feedback from GA quizzes
  const handleQuizComplete = (gaScores: { [key: string]: number }, weakTags: string[]) => {
    setScores(prev => {
      const revised = { ...prev, ...gaScores };
      compileWeakTopicsList(revised);
      return revised;
    });

    const gaScore = gaScores['General Awareness'] || 0;
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    setMockHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        label: `GA Quiz ${prev.length + 1}`,
        score: gaScore,
        date: dateStr
      }
    ]);
  };

  // Callback to compute diagnostic feedback from Descriptive Writing scores
  const handleGradingComplete = (topic: string, essayScore: number) => {
    setScores(prev => {
      const revised = { ...prev, 'Descriptive Writing': essayScore };
      compileWeakTopicsList(revised);
      return revised;
    });
  };

  const compileWeakTopicsList = (currentScores: { [key: string]: number }) => {
    const nextWeak: WeakTopic[] = [];
    
    const subjectTipsMap: { [key: string]: { testType: any; tip: string } } = {
      'Quantitative Aptitude': {
        testType: 'Mock Test',
        tip: 'Review boat speed ratios, standard series interpolation, and work-time formulas.'
      },
      'Reasoning Ability': {
        testType: 'Mock Test',
        tip: 'Practice logical circular scheduling, Syllogisms, and coding-decoding structures.'
      },
      'English Language': {
        testType: 'Mock Test',
        tip: 'Revise modifier segment comparison errors, prebuilt antonym pairings, and active clauses.'
      },
      'General Awareness': {
        testType: 'GA Quiz',
        tip: 'Review Union policy amendments, RBI Repo Rate timelines, and May-June 2026 current affairs.'
      },
      'Descriptive Writing': {
        testType: 'Essay Grade',
        tip: 'Improve introduction flow, grammatical integrity, and stick strictly to 150-250 target limits.'
      }
    };

    Object.keys(currentScores).forEach(sub => {
      const score = currentScores[sub];
      if (score > 0 && score < 60) {
        nextWeak.push({
          subject: sub,
          score,
          testType: subjectTipsMap[sub].testType,
          remedialTips: subjectTipsMap[sub].tip
        });
      }
    });

    setWeakTopics(nextWeak);
  };

  return (
    <div className="flex flex-row min-h-screen bg-slate-50/50 dark:bg-gray-950 text-slate-800 dark:text-gray-100 font-sans selection:bg-indigo-500/20" id="bankersvault-layout">
      {/* Permanent, Slim, Collapsible Left Sidebar */}
      <aside 
        className={`transition-all duration-300 ease-in-out border-r border-slate-200/50 dark:border-slate-850/60 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-screen sticky top-0 z-40 ${isSidebarCollapsed ? 'w-16 sm:w-20' : 'w-64'}`}
        id="sidebar-navigation"
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header / Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/40 gap-2 overflow-hidden">
              <div 
                className="flex items-center gap-2 cursor-pointer transition-all duration-300" 
                onClick={() => setActiveModule('DASHBOARD')}
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black font-mono shadow-md shrink-0">
                  BV
                </div>
                {!isSidebarCollapsed && (
                  <div className="whitespace-nowrap transition-opacity duration-300">
                    <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight font-sans">BankersVault</span>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded ml-1 align-middle animate-fade-in">
                      AI
                    </span>
                  </div>
                )}
              </div>

              {/* Sidebar toggle button (hidden on extra small viewports for spacing elegance) */}
              <button
                type="button"
                onClick={() => {
                  const nextVal = !isSidebarCollapsed;
                  setIsSidebarCollapsed(nextVal);
                  localStorage.setItem('sidebar_collapsed', String(nextVal));
                }}
                className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer hidden sm:flex items-center justify-center transition-all shrink-0 hover:scale-[1.03]"
                title={isSidebarCollapsed ? "Expand navigation sidebar" : "Collapse navigation sidebar"}
              >
                {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>

            {/* Nav list */}
            <nav className="py-6 px-3 space-y-1.5 flex flex-col" id="sidebar-nav-items">
              {[
                { id: 'DASHBOARD' as const, label: 'Hub Dashboard', icon: <LayoutGrid size={16} /> },
                { id: 'MOCK_TEST' as const, label: 'Timed Mock Test', icon: <BookOpen size={16} /> },
                { id: 'GENERAL_AWARENESS' as const, label: 'General Awareness', icon: <Sparkles size={16} /> },
                { id: 'DESCRIPTIVE' as const, label: 'Essay Grader', icon: <Trophy size={16} /> },
                { id: 'CALENDAR' as const, label: 'Calendar Planner', icon: <Calendar size={16} /> }
              ].map((item) => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveModule(item.id);
                      if (item.id === 'CALENDAR') {
                        setPreselectedSubject(null);
                      }
                    }}
                    className={`w-full flex items-center transition-all duration-150 rounded-xl relative group font-semibold cursor-pointer border border-transparent
                      ${isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold border-indigo-100/50 dark:border-indigo-900/30 shadow-xs' 
                        : 'text-gray-650 dark:text-gray-350 hover:bg-slate-105 dark:hover:bg-slate-800/40'
                      } 
                      ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-start gap-3.5 px-4 py-3'}
                    `}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    {/* Active state ribbon indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r bg-indigo-650 dark:bg-indigo-400" />
                    )}

                    <div className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                      {item.icon}
                    </div>

                    {!isSidebarCollapsed && (
                      <span className="text-xs transition-opacity duration-200 font-sans tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    )}

                    {/* Styled tooltip when sidebar is collapsed */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50 shadow-md whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar bottom slot */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/55 text-center flex flex-col items-center justify-center">
            {!isSidebarCollapsed ? (
              <div className="space-y-1 text-center w-full">
                <span className="text-[9px] text-slate-400 dark:text-gray-500 tracking-wider font-mono font-bold block uppercase leading-none">BANKERSVAULT COGNITIVE</span>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">v1.2.0 • Online Secure</p>
              </div>
            ) : (
              <div className="text-center font-mono text-[9px] text-indigo-500 font-black">
                V1.2
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Stage holding top header and module contents */}
      <div className="flex-grow flex flex-col min-h-screen min-w-0 bg-slate-50/50 dark:bg-gray-950">
        
        {/* Sleek minimal header for dark mode switcher and brand year information */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-85/60" id="main-stage-header">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-450 dark:text-gray-500 font-mono tracking-widest uppercase">
                {activeModule === 'DASHBOARD' ? 'HUB // PERFORMANCE INDEX' :
                 activeModule === 'MOCK_TEST' ? 'TIMED ASSESSMENT DECK' :
                 activeModule === 'GENERAL_AWARENESS' ? 'GA QUESTION BANK' :
                 activeModule === 'DESCRIPTIVE' ? 'ESSAY AUDIT MODULE' :
                 'STRATEGIC CALENDAR PLANNER'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono hidden sm:block">
                Exam Year: 2026 Core
              </div>

              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg border border-gray-150 dark:border-slate-800 hover:bg-gray-50/80 dark:hover:bg-slate-900 text-gray-600 dark:text-gray-200 transition cursor-pointer flex items-center justify-center shrink-0"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                id="theme-toggle-btn"
              >
                {isDarkMode ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} />}
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic content deck */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Google Auth Integration Section */}
          <GoogleSignIn
            user={user}
            onSignInSuccess={handleSignInSuccess}
            onSignOut={handleSignOut}
            isLoggingIn={isLoggingIn}
            setIsLoggingIn={setIsLoggingIn}
          />

          {/* Active section grid container - expands to full width on specific modules to ensure Clean Focus */}
          <div className={activeModule === 'DASHBOARD' ? "grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" : "block w-full space-y-6"}>
            
            {/* Primary Router card */}
            <div className={activeModule === 'DASHBOARD' ? "lg:col-span-3 transition-all duration-300 space-y-6" : "w-full transition-all duration-300 space-y-6"} id="active-routing-module">
              {activeModule === 'DASHBOARD' && (
                <Dashboard
                  scores={scores}
                  weakTopics={weakTopics}
                  history={mockHistory}
                  onTriggerModule={(mod) => {
                    if (mod === 'MOCK_TEST') setActiveModule('MOCK_TEST');
                    if (mod === 'GENERAL_AWARENESS') setActiveModule('GENERAL_AWARENESS');
                    if (mod === 'DESCRIPTIVE') setActiveModule('DESCRIPTIVE');
                  }}
                  onStudyAction={(subjectName) => {
                    setPreselectedSubject(subjectName);
                    setActiveModule('CALENDAR');
                  }}
                />
              )}

              {activeModule === 'MOCK_TEST' && (
                <MockTest
                  token={token}
                  onTestComplete={handleTestComplete}
                />
              )}

              {activeModule === 'GENERAL_AWARENESS' && (
                <GeneralAwareness
                  onQuizComplete={handleQuizComplete}
                />
              )}

              {activeModule === 'DESCRIPTIVE' && (
                <DescriptiveGrader
                  token={token}
                  onGradingComplete={handleGradingComplete}
                />
              )}

              {activeModule === 'CALENDAR' && (
                <CalendarScheduler
                  token={token}
                  weakTopics={weakTopics}
                  preselectedSubject={preselectedSubject}
                  setPreselectedSubject={setPreselectedSubject}
                />
              )}
            </div>

            {/* Sidebar element for history trending: only visible on Hub/Dashboard page */}
            {activeModule === 'DASHBOARD' && (
              <div className="lg:col-span-1 space-y-6" id="progress-trending-sidebar">
                <VisualProgressGraph
                  history={mockHistory}
                  onAddScore={(score) => {
                    const dateStr = new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    setMockHistory(prev => [
                      ...prev,
                      {
                        id: Math.random().toString(36).substring(2, 9),
                        label: `Mock Score ${prev.length + 1}`,
                        score,
                        date: dateStr
                      }
                    ]);
                  }}
                  onDeleteScore={(id) => {
                    setMockHistory(prev => prev.filter(item => item.id !== id));
                  }}
                />
              </div>
            )}

          </div>

        </main>

        {/* Humble Footer */}
        <footer className="border-t border-slate-200/50 dark:border-slate-850/60 py-6 text-center text-[11px] text-gray-400 dark:text-gray-500 font-sans" id="footer-branding">
          <p>Copyright © 2026 BankersVault AI. All material designed for the IBPS PO selection format.</p>
        </footer>
      </div>
    </div>
  );
}
