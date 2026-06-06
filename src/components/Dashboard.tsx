import React from 'react';
import { WeakTopic, MockHistoryItem } from '../types';
import { BookOpen, HelpCircle, AlertTriangle, ShieldCheck, TrendingUp, Info, AlertCircle, CheckCircle, Clock, Trophy } from 'lucide-react';

interface DashboardProps {
  scores: { [key: string]: number };
  weakTopics: WeakTopic[];
  history: MockHistoryItem[];
  onTriggerModule: (moduleId: 'MOCK_TEST' | 'GENERAL_AWARENESS' | 'DESCRIPTIVE') => void;
  onStudyAction?: (subjectName: string) => void;
}

const subTopicData: {
  [key: string]: {
    criticalSubTopic: string;
    needsPracticeSubTopic: string;
    maintenanceSubTopic: string;
    criticalTips: string;
    needsPracticeTips: string;
    maintenanceTips: string;
  }
} = {
  'Quantitative Aptitude': {
    criticalSubTopic: 'Quadratic Equations & Data Interpretation (DI) Basics',
    needsPracticeSubTopic: 'Arithmetic Word Problems (Time, Work & Speed)',
    maintenanceSubTopic: 'Higher Probability & Complex Number Series Sequences',
    criticalTips: 'Review fundamental ratio distribution and boat/stream basic formulas.',
    needsPracticeTips: 'Practice 15 sample data interpretation charts to decrease calculation times.',
    maintenanceTips: 'Solve advanced quadratic comparisons and sequence interpolation.'
  },
  'Reasoning Ability': {
    criticalSubTopic: 'Linear & Circular Seating Puzzle Arrangements',
    needsPracticeSubTopic: 'Syllogisms, Inequality Rules & Direction Blood Relationships',
    maintenanceSubTopic: 'Complex Machine Input-Output & Verbal Critical Assumptions',
    criticalTips: 'Draw clear circular bounds and list relative constraints sequentially.',
    needsPracticeTips: 'Practice inequality standard short-cuts to evaluate conclusions within 30s.',
    maintenanceTips: 'Attempt high-difficulty double-variable relational matrix puzzles.'
  },
  'English Language': {
    criticalSubTopic: 'Subject-Verb Agreements & Modifier Fault Segment Errors',
    needsPracticeSubTopic: 'Reading Comprehension Inference Clues & Text Cohesion',
    maintenanceSubTopic: 'Advanced Word Synonyms/Antonyms & Cloze Passages',
    criticalTips: 'Master part-of-speech rules and identify misplaced descriptive relative clauses.',
    needsPracticeTips: 'Skim paragraphs for topic sentences to locate arguments quickly.',
    maintenanceTips: 'Read diverse banking editorials and practice antonym grid associations.'
  },
  'General Awareness': {
    criticalSubTopic: 'Union Budget Revenue Allocations & RBI Repo-Rate Timelines',
    needsPracticeSubTopic: 'National Social/Physical Infrastructure Schemes',
    maintenanceSubTopic: 'Static Banking History & International Financial Standards',
    criticalTips: 'Revise monetary policy update summaries and policy rates meticulously.',
    needsPracticeTips: 'Memorize newly launched schemes, outlays, and target departments.',
    maintenanceTips: 'Reinforce Basel III norms, capital adequacy ratios, and historical banking acts.'
  },
  'Descriptive Writing': {
    criticalSubTopic: 'Introduction Thesis Paragraphs & Essay Core Structure',
    needsPracticeSubTopic: 'Coherent Logical Transitions & Argumentative Balance',
    maintenanceSubTopic: 'Strict Word Budget Management & Diverse Formatting Style',
    criticalTips: 'Ensure the first paragraph directly outlines your core financial stance.',
    needsPracticeTips: 'Utilize transitional connectives like "furthermore," "consequently," or "contrarily."',
    maintenanceTips: 'Practice exact 220-word budget constraints without leaking key arguments.'
  }
};

export default function Dashboard({ scores, weakTopics, history, onTriggerModule, onStudyAction }: DashboardProps) {
  
  const averageAll = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
  );

  // Data-Driven Analysis of mock exam history and subject scores
  const subjectsKeys = ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness', 'Descriptive Writing'];

  // Identify weak areas
  const attemptedScores = Object.values(scores).filter(s => s > 0);
  const averageAllAttempted = attemptedScores.length > 0 
    ? Math.round(attemptedScores.reduce((a, b) => a + b, 0) / attemptedScores.length) 
    : 0;

  // Let's analyze historical scores to see if there is any consistent weakness
  // (e.g. average of recent mocks in history is < 60%)
  const hasHistoryUnder60 = history && history.length > 0 && history.some(h => h.score < 60);
  
  // A student is considered struggling if they have any active subject score > 0 and < 60,
  // or if they have historical mock exams under 60% with no current high state.
  const isStruggling = (attemptedScores.length > 0 && (attemptedScores.some(s => s < 60) || averageAllAttempted < 60)) 
    || (attemptedScores.length === 0 && hasHistoryUnder60);

  // Generate priority list of focus areas dynamically
  const recommendations = subjectsKeys.map(sub => {
    const rawScore = scores[sub] ?? 0;
    const info = subTopicData[sub] || subTopicData['Quantitative Aptitude'];

    let status: 'Critical' | 'Needs Practice' | 'Maintenance' = 'Maintenance';
    let subTopic = info.maintenanceSubTopic;
    let tips = info.maintenanceTips;

    if (rawScore > 0) {
      if (rawScore < 50) {
        status = 'Critical';
        subTopic = info.criticalSubTopic;
        tips = info.criticalTips;
      } else if (rawScore < 60) {
        status = 'Needs Practice';
        subTopic = info.needsPracticeSubTopic;
        tips = info.needsPracticeTips;
      }
    } else {
      // Unattempted subjects in current session. Let's look at history to make a smart recommendation.
      // If history shows low scores (< 60), we default to 'Needs Practice' or 'Critical' for core sections to act as a priority start.
      if (hasHistoryUnder60 && (sub === 'Quantitative Aptitude' || sub === 'Reasoning Ability')) {
        status = 'Critical';
        subTopic = info.criticalSubTopic;
        tips = info.criticalTips;
      } else if (hasHistoryUnder60) {
        status = 'Needs Practice';
        subTopic = info.needsPracticeSubTopic;
        tips = info.needsPracticeTips;
      } else {
        // Safe default mode
        status = 'Needs Practice';
        subTopic = info.needsPracticeSubTopic;
        tips = info.needsPracticeTips;
      }
    }

    return {
      subject: sub,
      subTopic,
      status,
      score: rawScore,
      tips
    };
  });

  // Sort priorities: Critical first, then Needs Practice, then Maintenance
  const sortedRecs = [...recommendations].sort((a, b) => {
    const statusWeight = { 'Critical': 3, 'Needs Practice': 2, 'Maintenance': 1 };
    return statusWeight[b.status] - statusWeight[a.status];
  });

  const handleStudyAction = (subjectName?: string) => {
    if (onStudyAction && subjectName) {
      onStudyAction(subjectName);
    } else {
      const el = document.getElementById('calendar-scheduler-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="space-y-8" id="dashboard-main-panel">
      {/* Welcome Banner */}
      <div className="bg-slate-900/95 dark:bg-slate-950 border border-slate-800 text-white p-8 sm:p-10 rounded-xl relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
            <span className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse"></span>
            IBPS PO Premium SaaS Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight leading-tight text-white">
            Elevate Your Banking Rank with BankersVault AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed font-sans">
            Execute dynamic adaptive testing, generate rigorously evaluated diagnostic scorecards exported directly to Google Docs, and automatically organize Google Calendar remedial slots.
          </p>
          <div className="pt-3 flex flex-wrap gap-3">
            <button
              onClick={() => onTriggerModule('MOCK_TEST')}
              className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all duration-155 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <BookOpen size={13} />
              Take Mock Exam
            </button>
            <button
              onClick={() => onTriggerModule('DESCRIPTIVE')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 transition-all duration-155 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
            >
              <Trophy size={13} />
              Grade Essay
            </button>
          </div>
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-1/2 -right-24 h-64 w-64 -translate-y-1/2 rounded-full bg-indigo-600 opacity-15 blur-3xl pointer-events-none"></div>
      </div>

      {/* Bento Stats Map */}
      <div className="space-y-4" id="diagnostic-performance-matrix-section">
        <h3 className="text-xs font-bold font-sans tracking-widest uppercase text-slate-500 dark:text-slate-400">Diagnostic Performance Matrix</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { name: 'Quantitative Aptitude', key: 'Quantitative Aptitude', color: 'indigo' },
            { name: 'Reasoning Ability', key: 'Reasoning Ability', color: 'violet' },
            { name: 'English Language', key: 'English Language', color: 'sky' },
            { name: 'General Awareness', key: 'General Awareness', color: 'emerald' }
          ].map(sub => {
            const score = scores[sub.key] ?? 0;
            return (
              <div 
                key={sub.name} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between transform cursor-default group"
              >
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-450 dark:text-slate-500 font-bold uppercase block">{sub.name}</span>
                  <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-2 block leading-none transition-colors duration-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                    {score === 0 ? '—' : `${score}%`}
                  </span>
                </div>
                <div className="mt-5">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                       className={`h-full rounded-full transition-all duration-1000 ${score >= 70 ? 'bg-emerald-500' : score >= 60 ? 'bg-indigo-600' : score > 0 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                      style={{ width: `${score || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] mt-2.5">
                    <span className="text-slate-400 font-medium">Target: 75%+</span>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border
                      ${score >= 70 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900' 
                        : score >= 60 
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-450 dark:border-indigo-900' 
                          : score > 0 
                            ? 'bg-rose-50 text-rose-800 border-rose-250 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-950 dark:text-slate-500 dark:border-slate-850'}`}
                    >
                      <span className={`h-1 w-1 rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 60 ? 'bg-indigo-500' : score > 0 ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                      <span>{score >= 70 ? 'Excel State' : score >= 60 ? 'Competent' : score > 0 ? 'Needs Remedial' : 'No attempt'}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgraded Focus & Remedial Checklist with logical recommendations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between w-full space-y-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-sans tracking-tight flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-705 dark:text-indigo-400" />
              <span className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">
                Diagnostic Remedial Recommendations
              </span>
            </h4>

            {/* Contextual Tone Banner */}
            {!isStruggling && (
              <div className="px-4 py-2 rounded-xl border border-emerald-150 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-2 font-medium">
                <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Safe Core Standing:</strong> Maintain mock cadence to reinforce complex Data Interpretation.
                </span>
              </div>
            )}
          </div>

          {/* Priorities Task List */}
          <div className="space-y-4">
            <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Priority Tasks & Focus Areas ({sortedRecs.filter(r => r.status !== 'Maintenance').length} Urgent)
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sortedRecs.map((rec, index) => {
                const isCritical = rec.status === 'Critical';
                const isPractice = rec.status === 'Needs Practice';

                return (
                  <div 
                    key={index} 
                    className={`p-5 rounded-xl border flex flex-col justify-between gap-4 text-xs transition-all duration-200 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700
                      ${isCritical 
                        ? 'border-red-200 bg-red-50/20 dark:border-red-950/60 dark:bg-red-950/5' 
                        : isPractice 
                          ? 'border-amber-200 bg-amber-50/20 dark:border-amber-950/60 dark:bg-amber-950/5' 
                          : 'border-slate-200 bg-slate-50/30 dark:border-slate-800/60 dark:bg-slate-900/40'}`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {rec.subject}
                        </span>
                        
                        {/* Status indicators */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border
                          ${isCritical 
                            ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-900' 
                            : isPractice 
                              ? 'bg-amber-50 text-amber-800 border-amber-205 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-900' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-250 dark:bg-emerald-950/85 dark:text-emerald-300 dark:border-emerald-900'}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-rose-500' : isPractice ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          <span>{rec.status}</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 dark:text-slate-105 text-xs block text-slate-900 dark:text-white">
                          {rec.subTopic}
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                          {rec.tips}
                        </p>
                      </div>
                    </div>

                    {/* Actionable Call-To-Action if the subject is weak */}
                    {(isCritical || isPractice) ? (
                      <div className="pt-3 border-t border-slate-205 dark:border-slate-800/70 flex items-center justify-between gap-1.5">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          Current Score: {rec.score > 0 ? `${rec.score}%` : 'Diagnostic Pending'}
                        </span>
                        
                        <button
                          onClick={() => handleStudyAction(rec.subject)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/65 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shadow-3xs border border-indigo-200/50 dark:border-indigo-900/40"
                        >
                          <Clock size={11.5} />
                          <span>Study Action &rarr;</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-slate-205 dark:border-slate-800/70 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold gap-1.5">
                        <span>Elite Maintenance Achieved</span>
                        <span>Score: {rec.score}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs flex-wrap gap-4">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1.5">
            <Info size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>AI diagnostic tracking models live (5 primary prep vectors synchronized)</span>
          </span>
          <button
            onClick={() => handleStudyAction()}
            className="text-xs text-indigo-700 dark:text-indigo-405 font-bold hover:underline cursor-pointer flex items-center gap-1.5 transition-transform duration-150 hover:translate-x-0.5"
          >
            <span>Synchronize Remedial Calendar Sync</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
