import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { AlertTriangle, CheckCircle, Clock, Play, RotateCcw, Send, Sparkles } from 'lucide-react';

function FormattedQuestion({ text }: { text: string }) {
  if (!text) return null;
  
  // Check if text has a markdown table structure
  if (text.includes('|') && text.toLowerCase().includes('year')) {
    const lines = text.split('\n');
    const tableLines: string[] = [];
    const textBefore: string[] = [];
    const textAfter: string[] = [];
    let isTable = false;
    
    for (const line of lines) {
      if (line.trim().startsWith('|')) {
        isTable = true;
        tableLines.push(line);
      } else {
        if (isTable) {
          textAfter.push(line);
        } else {
          textBefore.push(line);
        }
      }
    }
    
    const parseRow = (line: string) => {
      return line.split('|').map(s => s.trim()).filter(Boolean);
    };
    
    if (tableLines.length >= 3) {
      const headers = parseRow(tableLines[0]);
      const rows = tableLines.slice(2).map(parseRow).filter(r => r.length > 0);
      
      return (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
            {textBefore.join('\n').trim()}
          </p>
          
          {/* Custom Premium Dashboard Grid */}
          <div className="my-4 bg-slate-50/70 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 shadow-inner">
            <div className="grid grid-cols-3 gap-4 pb-2.5 mb-2.5 border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              {headers.map((h, i) => (
                <div key={i} className={i === 0 ? 'text-left' : 'text-right'}>
                  {h}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              {rows.map((row, rIdx) => (
                <div 
                  key={rIdx} 
                  className="grid grid-cols-3 gap-4 items-center p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 hover:scale-[1.015] hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-850 transition-all duration-300 transform cursor-default"
                >
                  {row.map((cell, cIdx) => {
                    if (cIdx === 0) {
                      // Custom pill badge for the years
                      return (
                        <div key={cIdx} className="text-left">
                          <span className="inline-flex items-center px-3 py-1 text-xs font-extrabold font-mono text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-full shadow-3xs">
                            {cell}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div key={cIdx} className="text-right text-xs sm:text-sm font-mono font-bold text-gray-950 dark:text-gray-50">
                        {cell}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm font-semibold text-gray-850 dark:text-gray-300 leading-relaxed font-sans italic border-l-2 border-indigo-500 dark:border-indigo-400 pl-3">
            {textAfter.join('\n').trim()}
          </p>
        </div>
      );
    }
  }
  
  return (
    <span className="text-sm sm:text-base font-semibold text-gray-905 dark:text-gray-100 leading-relaxed font-sans block text-left">
      {text}
    </span>
  );
}

interface MockTestProps {
  token: string | null;
  onTestComplete: (results: { scores: { [key: string]: number }; weakTopics: string[]; overallScore?: number }) => void;
}

export default function MockTest({ token, onTestComplete }: MockTestProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Quiz active state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes default
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active Subject filter for display
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const autoGenerateQuiz = async () => {
    setIsLoadingQuiz(true);
    setQuizError(null);
    try {
      const response = await fetch('/api/generate-mock-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const validated = data.questions.map((q: any, index: number) => ({
          id: q.id || `AI_MOCK_${index + 1}_${Date.now()}`,
          question: q.question,
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < 4 ? q.correctAnswerIndex : 0,
          subject: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'].includes(q.subject) ? q.subject : 'Quantitative Aptitude',
          explanation: q.explanation || 'Consult standard bank curriculum references for this subject.'
        }));
        setQuestions(validated);
        setCurrentIdx(0);
        setUserAnswers({});
        setIsActive(false);
        setIsSubmitted(false);
        setTimeRemaining(validated.length * 60);
      } else {
        throw new Error('No valid questions received from Gemini AI generator.');
      }
    } catch (err: any) {
      console.error(err);
      setQuizError(err.message || 'Error occurred during automatic bank exam drafting.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  useEffect(() => {
    autoGenerateQuiz();
  }, []);

  useEffect(() => {
    if (isActive && timeRemaining > 0 && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isSubmitted, timeRemaining]);

  const handleStartExam = () => {
    setIsActive(true);
    setIsSubmitted(false);
    setUserAnswers({});
    setCurrentIdx(0);
    setTimeRemaining(questions.length * 60); // 1 minute per question
  };

  const handleSelectAnswer = (qId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Compute subject statistics
    const subjectScores: { [key: string]: { correct: number, total: number } } = {
      'Quantitative Aptitude': { correct: 0, total: 0 },
      'Reasoning Ability': { correct: 0, total: 0 },
      'English Language': { correct: 0, total: 0 },
      'General Awareness': { correct: 0, total: 0 }
    };

    let overallCorrect = 0;
    questions.forEach(q => {
      subjectScores[q.subject].total += 1;
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        subjectScores[q.subject].correct += 1;
        overallCorrect++;
      }
    });

    const scoresMap: { [key: string]: number } = {};
    const weakTopicsList: string[] = [];

    Object.keys(subjectScores).forEach(sub => {
      const { correct, total } = subjectScores[sub];
      if (total > 0) {
        const pt = (correct / total) * 105; // support scaling/rounding with upper limit
        const roundedScore = Math.min(100, Math.round(pt));
        scoresMap[sub] = roundedScore;
        if (roundedScore < 60) {
          weakTopicsList.push(sub);
        }
      }
    });

    const finalScorePct = questions.length > 0 ? Math.min(100, Math.round((overallCorrect / questions.length) * 100)) : 0;

    onTestComplete({
      scores: scoresMap,
      weakTopics: weakTopicsList,
      overallScore: finalScorePct
    });
  };

  const handleResetExam = () => {
    setIsActive(false);
    setIsSubmitted(false);
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeRemaining(600);
    autoGenerateQuiz();
  };

  // Filter questions relative to display tabs
  const filteredQuestions = activeTab === 'ALL' 
    ? questions 
    : questions.filter(q => q.subject === activeTab);

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8" id="timed-mock-test-module">
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold font-sans tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
              <span>Module 1: Timed Mock Test Engine</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900">
                <Sparkles size={11} className="animate-pulse" />
                <span>AI Powered</span>
              </span>
            </h3>
            <p className="text-xs text-slate-505 dark:text-slate-400 font-sans mt-1">
              Take real-time computer-based bank PO exams. Our system automatically drafts customized questions covering Data Interpretation, Number Series, Profit & Loss, Syllogisms, Seating Arrangements, and English Language components.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-450 font-bold bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {questions.length} questions loaded
            </span>
          </div>
        </div>

        {quizError && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-xs border border-red-100">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{quizError}</span>
          </div>
        )}

        {/* Start / Timer Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-4 border border-gray-100 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock size={20} className={timeRemaining < 300 && isActive ? "text-red-600 animate-pulse" : "text-gray-400"} />
            <div>
              <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Remaining Time</p>
              <p className={`text-xl font-mono font-bold leading-none ${timeRemaining < 300 && isActive ? 'text-red-600 font-black' : 'text-gray-950'}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          {isActive && timeRemaining < 300 && (
            <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse" id="countdown-alert">
              <AlertTriangle size={14} className="shrink-0" />
              <span>CRITICAL ACCURACY WARNING: Less than 5 minutes remaining!</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isActive && !isSubmitted && questions.length > 0 && !isLoadingQuiz && (
              <button
                onClick={handleStartExam}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 font-sans font-medium text-sm transition cursor-pointer"
              >
                <Play size={16} />
                <span>Begin Timed Assessment</span>
              </button>
            )}

            {isActive && (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-605 text-white rounded-xl shadow bg-red-600 hover:bg-red-700 font-sans font-medium text-sm transition cursor-pointer"
              >
                <Send size={16} />
                <span>Submit & Grade Exam</span>
              </button>
            )}

            {isSubmitted && (
              <button
                onClick={handleResetExam}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 bg-white rounded-xl hover:bg-gray-50 hover:text-gray-800 text-sm font-medium transition cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Re-take Exam (Draft New AI Set)</span>
              </button>
            )}

            {isLoadingQuiz && (
              <span className="text-xs font-bold text-indigo-600 animate-pulse flex items-center gap-1.5 bg-indigo-50 border border-indigo-150 px-4 py-2.5 rounded-xl">
                <RotateCcw size={14} className="animate-spin" />
                <span>Generating custom exam...</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoadingQuiz && (
        <div className="bg-white border border-gray-150 rounded-2xl p-12 text-center shadow-sm space-y-6 flex flex-col items-center justify-center min-h-[350px]">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            <Sparkles size={24} className="text-indigo-600 animate-bounce absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2 max-w-md">
            <h4 className="text-sm font-bold text-gray-950 uppercase tracking-widest animate-pulse">Drafting Custom Banking Exam</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Gemini is randomly constructing a unique real-world exam covering Profit & Loss, logical puzzles, and quantitative aptitude. Loading into test grid instantly...
            </p>
          </div>
        </div>
      )}

      {/* Quiz Body */}
      {(isActive || isSubmitted) && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Index Sidebar */}
          <div className="lg:col-span-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-5 shadow-xl shadow-slate-100/40 dark:shadow-none h-fit">
            <h4 className="text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-3">Questions Matrix</h4>
            
            {/* Subject Tabs */}
            <div className="flex flex-col gap-1.5 mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
              {['ALL', 'Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-left px-2.5 py-1.5 text-xs rounded-lg font-semibold transition ${activeTab === tab ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                >
                  {tab === 'ALL' ? 'All Sections' : tab.replace(' Language', '').replace(' Ability', '')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredQuestions.map((q, index) => {
                const globalIndex = questions.findIndex(globalQ => globalQ.id === q.id);
                const hasAnswered = userAnswers[q.id] !== undefined;
                const isCorrect = userAnswers[q.id] === q.correctAnswerIndex;
                
                let btnBgStyle = 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300';
                if (isSubmitted) {
                  btnBgStyle = isCorrect 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400' 
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-850 dark:text-red-400';
                } else if (globalIndex === currentIdx) {
                  btnBgStyle = 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-100/50';
                } else if (hasAnswered) {
                  btnBgStyle = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-250 dark:border-indigo-900 text-indigo-700 dark:text-indigo-450';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      const idx = questions.findIndex(val => val.id === q.id);
                      if (idx !== -1) setCurrentIdx(idx);
                    }}
                    className={`w-full py-2 hover:border-indigo-400 border text-xs font-bold rounded-lg font-mono transition leading-none text-center cursor-pointer ${btnBgStyle}`}
                  >
                    {globalIndex + 1}
                  </button>
                );
              })}
            </div>
            
            {isSubmitted && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-500 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Correct Option match</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-650">
                  <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span>
                  <span>Incorrect / Missed math</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Question Display */}
          <div className="lg:col-span-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/50 rounded-2xl p-6 shadow-xl shadow-slate-100/40 dark:shadow-none flex flex-col justify-between min-h-[420px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold px-2.5 py-1 rounded-full uppercase">
                  {questions[currentIdx]?.subject}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>

              <div className="pt-2">
                <FormattedQuestion text={questions[currentIdx]?.question} />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 pt-3">
                {questions[currentIdx]?.options.map((opt, oIdx) => {
                  const qId = questions[currentIdx].id;
                  const isSelected = userAnswers[qId] === oIdx;
                  const isCorrect = questions[currentIdx].correctAnswerIndex === oIdx;
                  
                  let optionStyle = 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/25 hover:bg-slate-50 hover:scale-[1.01] hover:shadow-xs active:scale-99';
                  if (isSelected && !isSubmitted) {
                    optionStyle = 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-200 ring-4 ring-indigo-500/25 scale-[1.012] shadow-md';
                  } else if (isSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/35 text-emerald-900 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20';
                    } else if (isSelected) {
                      optionStyle = 'border-red-400 bg-red-50/75 dark:bg-red-950/35 text-red-800 dark:text-red-300 ring-2 ring-red-400/20';
                    } else {
                      optionStyle = 'border-gray-150/60 dark:border-slate-800/60 bg-gray-50/40 dark:bg-slate-900/10 opacity-55';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(qId, oIdx)}
                      disabled={isSubmitted}
                      className={`text-left p-4 border rounded-xl text-xs sm:text-sm font-sans flex items-center gap-3 transition-all duration-200 cursor-pointer ${optionStyle}`}
                    >
                      <span className={`h-8 w-8 rounded-lg text-xs flex items-center justify-center font-bold uppercase shrink-0 transition ${isSelected ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-350'}`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation section */}
              {isSubmitted && questions[currentIdx]?.explanation && (
                <div className="mt-4 p-4 border border-indigo-100 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl space-y-2">
                  <h5 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 font-sans tracking-wide uppercase">Remedial Concept & Solution explanation:</h5>
                  <p className="text-xs text-gray-750 dark:text-gray-300 leading-relaxed font-sans">{questions[currentIdx].explanation}</p>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-800/80 mt-6 font-sans">
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-5 py-2.5 text-xs font-bold font-sans border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-xl hover:scale-103 hover:shadow-md hover:border-indigo-450 active:scale-97 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
              >
                Previous
              </button>

              <button
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIdx === questions.length - 1}
                className="px-5 py-2.5 text-xs font-bold font-sans border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-xl hover:scale-103 hover:shadow-md hover:border-indigo-450 active:scale-97 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
              >
                Next (Skip)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
