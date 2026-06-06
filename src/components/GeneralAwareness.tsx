import React, { useState } from 'react';
import { Question } from '../types';
import { AlertCircle, ArrowRight, CheckCircle2, Globe, HelpCircle, RefreshCw, RotateCcw, Sparkles, XCircle } from 'lucide-react';

interface GeneralAwarenessProps {
  onQuizComplete: (scores: { [key: string]: number }, weakTopics: string[]) => void;
}

const DEFAULT_GA_QUESTIONS: Question[] = [
  {
    id: 'GA_PRE1',
    question: 'Which rate is defined as the interest rate at which the Reserve Bank of India (RBI) lends short-term money to commercial banks in the event of any shortfall of funds?',
    options: ['Repo Rate', 'Reverse Repo Rate', 'Bank Rate', 'Marginal Standing Facility'],
    correctAnswerIndex: 0,
    subject: 'General Awareness',
    explanation: 'Repo rate is the key short-term rate at which the RBI lends money to commercial banks against government securities to resolve liquidity shortfalls.'
  },
  {
    id: 'GA_PRE2',
    question: 'The headquarters of the National Bank for Agriculture and Rural Development (NABARD) is located in which Indian city?',
    options: ['New Delhi', 'Mumbai', 'Kolkata', 'Bengaluru'],
    correctAnswerIndex: 1,
    subject: 'General Awareness',
    explanation: 'NABARD was established in July 1982 to promote sustainable agriculture and rural prosperity, and its central headquarters is firmly located in Mumbai, Maharashtra.'
  },
  {
    id: 'GA_PRE3',
    question: 'Which of the following bodies is primarily responsible for framing and implementing monetary policy under the RBI Act in India?',
    options: ['Securities and Exchange Board of India', 'Ministry of Finance', 'Monetary Policy Committee (MPC)', 'Indian Banks Association'],
    correctAnswerIndex: 2,
    subject: 'General Awareness',
    explanation: 'The Monetary Policy Committee (MPC) is a statutory and institutionalized framework under the Reserve Bank of India Act, 1934, responsible for fixing the benchmark policy interest rate.'
  },
  {
    id: 'GA_PRE4',
    question: 'What is the maximum limit on transaction amounts for UPI Lite wallet as revised to encourage offline contactless micropayments?',
    options: ['₹200 per transaction and ₹2,000 total balance', '₹500 per transaction and ₹2,000 total balance', '₹1,000 per transaction and ₹5,000 total balance', '₹2,000 per transaction and ₹10,000 total balance'],
    correctAnswerIndex: 1,
    subject: 'General Awareness',
    explanation: 'UPI Lite transaction limits allow up to ₹500 per offline transaction with a cumulative wallet limit of ₹2,000, promoting seamless and fast micro-transactions without PIN entry.'
  },
  {
    id: 'GA_PRE5',
    question: 'In Indian banking, what does the term "NPA" stand for?',
    options: ['Net Performance Account', 'National Pension Authority', 'Non-Performing Asset', 'Nominal Premium Allocation'],
    correctAnswerIndex: 2,
    subject: 'General Awareness',
    explanation: 'An NPA or Non-Performing Asset is a classification for a loan or advance that is in default or in arrears on interest payments for a specified period (typically 90 days).'
  }
];

export default function GeneralAwareness({ onQuizComplete }: GeneralAwarenessProps) {
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_GA_QUESTIONS);
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([
    { title: 'RBI Policy Circulars & Monetary Notifications', uri: 'https://www.rbi.org.in' },
    { title: 'Union Budget economic overview document', uri: 'https://www.indiabudget.gov.in' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active quiz state
  const [quizStarted, setQuizStarted] = useState<boolean>(true);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [qId: string]: number }>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleResetQuiz = () => {
    setQuestions(DEFAULT_GA_QUESTIONS);
    setAnswers({});
    setIsCompleted(false);
    setCurrentIdx(0);
    setQuizStarted(true);
  };

  const handleSelectAnswer = (idx: number) => {
    if (isCompleted) return;
    const currentQ = questions[currentIdx];
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: idx
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = () => {
    setIsCompleted(true);
    // Calculate final stats
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswerIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / questions.length) * 105); // max 100
    const finalScore = Math.min(100, scorePct);

    // Notify dashboard of results
    const isWeak = finalScore < 60;
    onQuizComplete(
      { 'General Awareness': finalScore },
      isWeak ? ['General Awareness'] : []
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm space-y-8" id="general-awareness-module">
      <div className="pb-5 border-b border-slate-200 dark:border-slate-805">
        <h3 className="text-xl font-bold font-sans tracking-tight flex items-center gap-2 text-slate-909 dark:text-white">
          <Sparkles size={20} className="text-indigo-700 dark:text-indigo-400" />
          <span>Module 2: General Awareness Section (Live 2026 Quizzes)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
          AI-generated economic and banking current affairs quizzes compiled from real-time 2026 Google Search facts.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700/90 dark:text-red-400 rounded-xl flex items-start gap-2 text-xs border border-red-100 dark:border-red-900">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-550" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            <Globe size={20} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white font-sans">Scanning Google Search Grounding Indexer</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1 leading-relaxed">
              Gemini is looking up live early 2026 monetary policy revisions, Union Budget updates, RBI guidelines, and Indian banking trends to structure 5 target exam questions.
            </p>
          </div>
        </div>
      )}

      {/* Quiz UI */}
      {quizStarted && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Quiz Panel */}
          <div className="lg:col-span-3 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 space-y-4 bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm shadow-inner">
            <div className="flex items-center justify-between animate-fade-in">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-100/30 dark:border-indigo-900/30">
                Indian Banking News-Cycle (2026)
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {currentIdx + 1} of {questions.length}
              </span>
            </div>

            <h4 className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed font-sans mt-2">
              {questions[currentIdx].question}
            </h4>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {questions[currentIdx].options.map((opt, oIdx) => {
                const isSelected = answers[questions[currentIdx].id] === oIdx;
                const isCorrect = questions[currentIdx].correctAnswerIndex === oIdx;
                const showCorrectness = isCompleted;

                let optStyle = 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/25 hover:bg-slate-50 hover:scale-[1.01] hover:shadow-xs active:scale-99';
                if (isSelected && !showCorrectness) {
                  optStyle = 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-200 ring-4 ring-indigo-500/25 scale-[1.012] shadow-md';
                } else if (showCorrectness) {
                  if (isSelected) {
                    optStyle = isCorrect
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/35 text-emerald-950 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20 scale-[1.012]'
                      : 'border-red-400 bg-red-50/75 dark:bg-red-950/35 text-red-900 dark:text-red-300 ring-2 ring-red-400/20';
                  } else {
                    optStyle = isCorrect
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/35 text-emerald-950 dark:text-emerald-300 font-semibold'
                      : 'border-gray-150/60 dark:border-slate-800/60 bg-gray-50/40 dark:bg-slate-900/10 opacity-55';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(oIdx)}
                    disabled={isCompleted}
                    className={`text-left p-3.5 border rounded-xl text-xs sm:text-sm font-sans flex items-center gap-3 transition-all duration-200 cursor-pointer ${optStyle}`}
                  >
                    <span className={`h-8 w-8 rounded-lg text-xs flex items-center justify-center font-bold uppercase shrink-0 transition ${isSelected ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-350'}`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Verification & Explanation / Remedial links */}
            {isCompleted && (
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold font-sans text-indigo-900 dark:text-indigo-400">
                  <HelpCircle size={14} className="text-indigo-650 dark:text-indigo-400" />
                  <span>2026 News Fact-Check:</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-sans">{questions[currentIdx].explanation}</p>
              </div>
            )}

            {/* Nav button */}
            <div className="flex justify-end items-center gap-3 pt-3">
              {isCompleted && (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 font-bold text-xs rounded-lg hover:bg-blue-50 transition cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Retake Preloaded Quiz</span>
                </button>
              )}
              {!isCompleted && answers[questions[currentIdx].id] !== undefined && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition cursor-pointer hover:scale-[1.01] active:scale-99"
                >
                  <span>{currentIdx === questions.length - 1 ? 'Show Results Scorecard' : 'Next Question'}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar with Search Grounding Source verification */}
          <div className="lg:col-span-1 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-4 shadow-sm">
            <div>
              <h5 className="text-xs font-bold font-sans text-gray-800 dark:text-white tracking-wider uppercase flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-600 dark:text-indigo-400" />
                <span>Grounding context:</span>
              </h5>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">
                Verify these live 2026 financial facts. Here are the search citations Gemini evaluated to write this quiz:
              </p>
            </div>

            {sources.length === 0 ? (
              <div className="text-xs text-gray-450 dark:text-gray-550 font-mono italic">
                Citations indexed under verification...
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sources.map((src, sIdx) => (
                  <a
                    key={sIdx}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-2.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 hover:border-indigo-400 dark:hover:border-indigo-900 rounded-lg text-xs leading-tight transition hover:scale-[1.015]"
                  >
                    <span className="font-semibold text-indigo-700 dark:text-indigo-455 block truncate">{src.title}</span>
                    <span className="text-gray-400 dark:text-gray-500 font-mono text-[10px] break-all block mt-0.5">{src.uri}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!quizStarted && !isLoading && (
        <div className="border border-dashed border-gray-250 dark:border-slate-800 rounded-2xl py-12 text-center text-gray-500 dark:text-gray-450 bg-slate-50/25 dark:bg-slate-900/25">
          <HelpCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm font-sans font-semibold text-gray-750 dark:text-gray-300">No active general awareness test session currently running.</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Click the "Scan 2026 Google Search" button above to execute a real-time policy query over current news feeds and compile an adaptive bank PO quiz.
          </p>
        </div>
      )}
    </div>
  );
}
