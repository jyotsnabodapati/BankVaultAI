import React, { useState } from 'react';
import { WeakTopic } from '../types';
import { AlertCircle, Calendar, CheckCircle, CheckSquare, Clock, Loader2, Square } from 'lucide-react';
import { googleSignIn } from '../lib/auth';

interface CalendarSchedulerProps {
  token: string | null;
  weakTopics: WeakTopic[];
  preselectedSubject?: string | null;
  setPreselectedSubject?: (subject: string | null) => void;
}

export default function CalendarScheduler({ token, weakTopics, preselectedSubject, setPreselectedSubject }: CalendarSchedulerProps) {
  const [localWeakTopics, setLocalWeakTopics] = useState<WeakTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [schedError, setSchedError] = useState<string | null>(null);
  const [schedSuccess, setSchedSuccess] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setSchedError(null);
    try {
      await googleSignIn();
    } catch (err: any) {
      console.error(err);
      setSchedError(err.message || 'Google Authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Initialize and synchronize local weak topics with actual values, defaulting to simulated ones
  React.useEffect(() => {
    if (weakTopics && weakTopics.length > 0) {
      setLocalWeakTopics(weakTopics);
    } else {
      // Elegant fallback simulated Chapters so they can test daily schedule blocks immediately
      setLocalWeakTopics([
        {
          subject: 'Quantitative Aptitude',
          score: 48,
          testType: 'Mock Test',
          remedialTips: 'Review boat speed ratios, standard series interpolation, and work-time formulas.'
        },
        {
          subject: 'Reasoning Ability',
          score: 54,
          testType: 'Mock Test',
          remedialTips: 'Practice logical circular scheduling, Syllogisms, and coding-decoding structures.'
        }
      ]);
    }
  }, [weakTopics]);

  // Auto-fill checkbox selection if localWeakTopics changes or handle preselected subject focus
  React.useEffect(() => {
    if (preselectedSubject) {
      setSelectedTopics([preselectedSubject]);
      
      // If preselectedSubject is not in localWeakTopics, let's append it to let them view and configure it!
      const exists = localWeakTopics.some(wt => wt.subject === preselectedSubject);
      if (!exists) {
        const fallbackTips: { [key: string]: string } = {
          'Quantitative Aptitude': 'Review boat speed ratios, standard series interpolation, and work-time formulas.',
          'Reasoning Ability': 'Practice logical circular scheduling, Syllogisms, and coding-decoding structures.',
          'English Language': 'Revise modifier segment comparison errors, prebuilt antonym pairings, and active clauses.',
          'General Awareness': 'Review Union policy amendments, RBI Repo Rate timelines, and May-June 2026 current affairs.',
          'Descriptive Writing': 'Improve introduction flow, grammatical integrity, and stick strictly to 150-250 target limits.'
        };
        const fallbackTestType: { [key: string]: 'Mock Test' | 'GA Quiz' | 'Essay Grade' } = {
          'Quantitative Aptitude': 'Mock Test',
          'Reasoning Ability': 'Mock Test',
          'English Language': 'Mock Test',
          'General Awareness': 'GA Quiz',
          'Descriptive Writing': 'Essay Grade'
        };

        setLocalWeakTopics(prev => [
          ...prev,
          {
            subject: preselectedSubject,
            score: weakTopics.find(wt => wt.subject === preselectedSubject)?.score ?? 0,
            testType: fallbackTestType[preselectedSubject] ?? ('Mock Test' as const),
            remedialTips: fallbackTips[preselectedSubject] ?? 'Detailed diagnostic study guidelines.'
          }
        ]);
      }

      // Smooth scroll to the container
      setTimeout(() => {
        const el = document.getElementById('calendar-scheduler-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);
    } else if (localWeakTopics.length > 0) {
      setSelectedTopics(localWeakTopics.map(wt => wt.subject));
    }
  }, [localWeakTopics, preselectedSubject, weakTopics]);

  const handleToggleTopic = (subject: string) => {
    if (setPreselectedSubject && preselectedSubject === subject) {
      setPreselectedSubject(null);
    }
    setSelectedTopics(prev =>
      prev.includes(subject)
        ? prev.filter(t => t !== subject)
        : [...prev, subject]
    );
  };

  const handleScheduleEvents = async (topics: string[]) => {
    console.log("Calendar sync button clicked. Target topics passed as arguments:", topics);

    // Immediate spinner activation to inform the user that the request is processing
    setIsScheduling(true);
    setSchedError(null);
    setSchedSuccess(null);

    if (!topics || topics.length === 0) {
      setSchedError('Please select at least one study focus topic to schedule.');
      setIsScheduling(false);
      return;
    }

    if (!token) {
      setSchedError('Authentication required: You are currently session-bound in Guest Mode. Please connect your Google Account to authorize live calendar syncing.');
      setIsScheduling(false);
      return;
    }

    let successfullyCreatedCount = 0;

    try {
      // Loop and schedule events starting tomorrow
      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        
        // Calculate dynamic dates: Tomorrow, start at 10:00 AM + i * 2 hour slots
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + 1); // tomorrow
        
        const startHour = 10 + (i * 2); // 10:00 AM, 12:00 PM, 2:00 PM
        const start = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHour, 0, 0);
        const end = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHour + 1, 0, 0);

        const eventPayload = {
          summary: `[BankersVault AI] Remedial Study: ${topic}`,
          description: `Automatically scheduled diagnostic session based on low mock scores for the subject: ${topic}.\n\nRemedial focus list:\n- Solve 15 mock practice modules\n- Double check solution explanations\n- Read current 2026 banking news updates\n- Practice essay structural templates.\n\nKeep up the effort!`,
          start: {
            dateTime: start.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
          },
          end: {
            dateTime: end.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
          }
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(eventPayload)
        });

        if (response.ok) {
          successfullyCreatedCount++;
        } else {
          const errLogs = await response.text();
          console.error(`Calendar insertion error for ${topic}:`, errLogs);
        }
      }

      if (successfullyCreatedCount > 0) {
        setSchedSuccess(`Successfully scheduled ${successfullyCreatedCount} daily remedial study slot(s) directly on your Google Calendar! Go check your calendar for tomorrow!`);
      } else {
        throw new Error('Google Calendar API returned rejection states for all events.');
      }
    } catch (err: any) {
      console.error(err);
      setSchedError(err.message || 'An error occurred during Calendar scheduling.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl shadow-slate-100/40 dark:shadow-none space-y-4" id="calendar-scheduler-container">
      <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-slate-800">
        <Calendar size={22} className="text-indigo-600 dark:text-indigo-400" />
        <div>
          <h4 className="text-sm font-extrabold font-sans tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Daily Remedial Calendar Sync</span>
          </h4>
          <p className="text-xs text-gray-400 dark:text-gray-500">Based on diagnostic analytics, synchronize dedicated remedial classes on your Google Calendar.</p>
        </div>
      </div>

      {localWeakTopics.length === 0 ? (
        <div className="py-4 text-center text-xs text-rose-500 font-medium bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100/60 p-3">
          No diagnostic weak chapters computed yet. Take a Mock Test or Grade an Essay to determine weak focus areas dynamically!
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-gray-650 dark:text-gray-400 font-sans flex items-center justify-between">
            <span>Choose chapters to block time for on your schedule:</span>
            {weakTopics.length === 0 && (
              <span className="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-450 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-2 py-0.5 rounded">
                Sample Study Plans
              </span>
            )}
          </p>

          <div className="space-y-2">
            {localWeakTopics.map(wt => {
              const isChecked = selectedTopics.includes(wt.subject);
              const isPreselected = preselectedSubject === wt.subject;
              return (
                <div
                  key={wt.subject}
                  onClick={() => handleToggleTopic(wt.subject)}
                  className={`flex items-start justify-between p-3.5 border rounded-xl cursor-pointer transition flex-col sm:flex-row gap-2 select-none hover:scale-[1.01] hover:shadow-xs active:scale-99 duration-200 ${
                    isPreselected
                      ? 'bg-indigo-100/50 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-4 ring-indigo-500/40 animate-[pulse_2s_infinite]'
                      : isChecked
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-550 dark:border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-4 ring-indigo-500/10'
                        : 'bg-slate-50/60 dark:bg-slate-900/45 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  <div className="flex gap-2.5">
                    {isChecked ? (
                      <CheckSquare size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    ) : (
                      <Square size={16} className="text-gray-400 dark:text-gray-500 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-sans">{wt.subject}</span>
                        <span className="text-[9px] font-mono font-bold bg-white dark:bg-slate-950 px-1.5 py-0.5 border border-indigo-100 dark:border-indigo-900 text-indigo-800 dark:text-indigo-400 rounded">
                          Score: {wt.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-450 dark:text-gray-400 leading-normal mt-0.5">{wt.remedialTips}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-800 uppercase shrink-0">
                    {wt.testType}
                  </span>
                </div>
              );
            })}
          </div>

          {!token && (
            <div className="p-4 bg-amber-50/75 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 rounded-xl space-y-2.5 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
                <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Guest Mode Active — Integration Paused</span>
              </div>
              <p className="text-xs text-amber-700/90 dark:text-amber-400 leading-relaxed font-sans">
                Google Calendar synchronization requires identification to securely authorize dynamic calendar schedules. Please authenticate using the button below or the security suite at the top of the interface to schedule real remedial study sessions.
              </p>
            </div>
          )}

          <div className="pt-2">
            {!token ? (
              <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-605 via-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl shadow-lg font-sans font-semibold text-xs sm:text-sm hover:scale-[1.01] active:scale-99 transition-all cursor-pointer disabled:opacity-50"
                id="btn-sync-calendar-signin"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Connecting to Google Account...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    <span>Sign In with Google to Enable Sync ({selectedTopics.length})</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleScheduleEvents(selectedTopics)}
                disabled={isScheduling || selectedTopics.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white rounded-xl shadow-lg font-sans font-semibold text-xs sm:text-sm hover:scale-[1.01] active:scale-99 transition-all cursor-pointer disabled:opacity-45"
                id="btn-sync-calendar"
              >
                {isScheduling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Scheduling Calendar Events...</span>
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    <span>Configure Calendar Remedial Slots ({selectedTopics.length})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {schedError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg flex items-start gap-2 text-xs border border-red-100 dark:border-red-900/60 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{schedError}</span>
            </div>
          )}

          {schedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg flex items-start gap-2 text-xs border border-emerald-100 animate-fade-in shadow-2xs">
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
              <span className="flex-1 font-sans">{schedSuccess}</span>
              <button 
                type="button" 
                onClick={() => setSchedSuccess(null)}
                className="hover:bg-emerald-100/50 p-1 rounded font-bold cursor-pointer text-emerald-700 text-xs ml-2 select-none"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
