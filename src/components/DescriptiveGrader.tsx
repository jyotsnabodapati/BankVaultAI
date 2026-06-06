import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { EssaySubmission } from '../types';
import { AlertCircle, CheckCircle2, FileText, ExternalLink, GraduationCap, Loader2, Sparkles } from 'lucide-react';

interface DescriptiveGraderProps {
  token: string | null;
  onGradingComplete: (topic: string, score: number) => void;
}

const standardPrompts = [
  "Is the digitalization of banking systems reducing security or increasing accessibility?",
  "The impact of micro-finance institutions on the rural economy of India.",
  "Should public-sector banks be privatized to secure operational stability?",
  "Describe the risks and benefits of Central Bank Digital Currency (CBDC/Digital Rupee)."
];

export default function DescriptiveGrader({ token, onGradingComplete }: DescriptiveGraderProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(standardPrompts[0]);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [essayText, setEssayText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EssaySubmission | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  const currentCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const progressPercent = Math.min((currentCount / 250) * 100, 100);

  const activeTopic = selectedTopic === 'CUSTOM' ? customTopic : selectedTopic;

  const handleGradeEssay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTopic.trim()) {
      setError('Please provide or specify a descriptive writing essay topic.');
      return;
    }
    if (currentCount < 20) {
      setError('Your essay is too short. Please compose a comprehensive essay (at least 20 words) to evaluate properly.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setDocUrl(null);

    try {
      const response = await fetch('/api/grade-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: activeTopic,
          essayText,
          accessToken: token // Pass the token for automatic Google Docs generation if connected
        })
      });

      if (!response.ok) {
        throw new Error('An error occurred during evaluation. Please verify server limits and try again.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.outOfScope) {
        setResult({
          topic: activeTopic,
          essayText,
          wordCount: currentCount,
          grammarScore: 0,
          structureScore: 0,
          contentScore: 0,
          overallScore: 0,
          detailedReview: data.reason || 'Syllabus mismatch or invalid input text.',
          outOfScope: true,
          outOfScopeWarning: data.outOfScopeWarning || 'Topic Out of Scope: Please provide an essay related to the banking sector.'
        });
        return;
      }

      const evalData = data.evaluation;
      setResult({
        topic: activeTopic,
        essayText,
        wordCount: evalData.wordCount,
        grammarScore: evalData.grammarScore,
        structureScore: evalData.structureScore,
        contentScore: evalData.contentScore,
        overallScore: evalData.overallScore,
        detailedReview: evalData.detailedReview
      });

      if (data.googleDoc) {
        if (data.googleDoc.error) {
          setError(data.googleDoc.error);
        } else {
          setDocUrl(data.googleDoc.docUrl);
        }
      }

      // Track weak descriptive writing if scores are low
      onGradingComplete(activeTopic, evalData.overallScore);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Descriptive test evaluation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const getWordCountStatus = (count: number) => {
    if (count >= 150 && count <= 250) {
      return { text: 'Perfect length (150-250 words)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    } else if (count >= 120 && count <= 300) {
      return { text: 'Acceptable length, but aim for 150-250 words', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    } else {
      return { text: 'Suboptimal length (strictly target 150-250 words)', color: 'text-red-700 bg-red-50 border-red-200' };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm space-y-8" id="descriptive-grader-module">
      <div>
        <h3 className="text-xl font-bold font-sans tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
          <GraduationCap size={22} className="text-indigo-700 dark:text-indigo-400" />
          <span>Module 3: AI Descriptive Test Grader (High Reasoning Analysis)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
          Practice standard essay compositions. The AI grades grammar, word count parameters, structural transitions, and directly compiles comprehensive scorecards to Google Docs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Submission box */}
        <div className="space-y-6">
          <form onSubmit={handleGradeEssay} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-705 dark:text-slate-350 mb-2 font-sans tracking-tight uppercase">Select Essay Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-white text-slate-900 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650"
              >
                {standardPrompts.map((p, pIdx) => (
                  <option key={pIdx} value={p}>
                    {p.length > 50 ? `${p.slice(0, 50)}...` : p}
                  </option>
                ))}
                <option value="CUSTOM">Compose Custom / Custom Topic</option>
              </select>
            </div>

            {selectedTopic === 'CUSTOM' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Topic Title</label>
                <input
                  type="text"
                  placeholder="E.g., Role of Artificial Intelligence in Asset Management..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 bg-white text-slate-905 dark:bg-slate-900 focus:outline-indigo-500"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-400">Write Essay here</label>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                  Target: 150 - 250 words
                </span>
              </div>
              <textarea
                rows={13}
                placeholder="Type your essay or letter here..."
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-805 rounded-xl p-4 bg-white text-slate-900 dark:text-slate-105 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 leading-relaxed font-sans shadow-inner"
              />
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 dark:text-slate-500">Progress towards target limit:</span>
                  <span className={`font-bold transition-colors duration-200 ${
                    (currentCount < 150 || currentCount > 250) 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-indigo-700 dark:text-indigo-400'
                  }`}>
                    Words: {currentCount}/250
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (currentCount < 150 || currentCount > 250) 
                        ? 'bg-red-500' 
                        : 'bg-indigo-650'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl shadow hover:shadow-indigo-550/10 font-sans font-bold text-sm transition-all duration-150 disabled:opacity-50 cursor-pointer active:scale-[0.985]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Evaluating Composition Rigorously...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Verify & Grade Essay</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-lg flex items-start gap-2 text-xs border border-rose-100">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {!token && (
            <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-[11px] font-sans border border-amber-100">
              💡 <strong>No active authentication detected:</strong> authenticate Google Services above to export reports directly into your personal Google Docs library. Unauthenticated evaluation will still display on-screen.
            </div>
          )}
        </div>

        {/* Scoring Scorecard View */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/55 shadow-sm overflow-hidden">
          {result ? (
            result.outOfScope ? (
              <div className="space-y-6">
                <div className="pb-4 border-b border-gray-100 dark:border-slate-800">
                  <h4 className="text-xs text-gray-400 dark:text-slate-505 font-mono uppercase tracking-wider">Grade Report</h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{result.topic}</p>
                </div>

                <div className="p-4 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-300 space-y-3 shadow-sm">
                  <div className="flex items-start gap-2 text-sm font-bold">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span>{result.outOfScopeWarning || 'Topic Out of Scope: Please provide an essay related to the banking sector.'}</span>
                  </div>
                  {result.detailedReview && (
                    <div className="text-xs border-t border-rose-200/50 dark:border-rose-900/10 pt-2.5 font-sans leading-relaxed text-rose-700 dark:text-rose-450 whitespace-pre-wrap select-text">
                      <strong>AI Quality & Relevance Audit:</strong><br />
                      {result.detailedReview}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/40 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-850">
                  <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 font-sans">Syllabus Guidance Filter</h5>
                  <p className="text-xs text-gray-605 dark:text-gray-400 font-sans leading-relaxed">
                    The Descriptive Writing paper is strictly gauged for topics covering relevant economic areas, financial institutions, policy-making, or national-importance policies. Submitting random words, repeating terms, keyboard-smashing, or off-topic compositions is automatically flagged as invalid.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs text-gray-400 dark:text-slate-505 font-mono uppercase tracking-wider">Grade Report</h4>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">{result.topic}</p>
                  </div>

                  <div className="text-center bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 px-4 py-2 rounded-xl shrink-0">
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-400 uppercase tracking-widest block font-bold leading-none mb-0.5 font-sans">Overall Score</span>
                    <span className="text-2xl font-black font-mono text-indigo-950 dark:text-white leading-none">{result.overallScore}</span>
                    <span className="text-xs text-gray-400 font-mono">/100</span>
                  </div>
                </div>

                {/* bento scores */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl p-3.5 shadow-sm text-center">
                  <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-505 uppercase">Grammar</span>
                  <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono">{result.grammarScore}<span className="text-xs text-gray-405">/10</span></p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl p-3.5 shadow-sm text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Structure</span>
                  <p className="text-lg font-extrabold text-violet-600 dark:text-violet-400 mt-1 font-mono">{result.structureScore}<span className="text-xs text-gray-405">/10</span></p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl p-3.5 shadow-sm text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Cohesion</span>
                  <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-450 mt-1 font-mono">{result.contentScore}<span className="text-xs text-gray-405">/10</span></p>
                </div>
              </div>

              {/* word count ribbon */}
              <div className={`p-3 border rounded-xl flex items-center justify-between text-xs font-semibold ${getWordCountStatus(result.wordCount).color}`}>
                <span>Calculated Word Count: {result.wordCount} words</span>
                <span className="text-[10px] uppercase font-bold tracking-wide">{getWordCountStatus(result.wordCount).text}</span>
              </div>

              {/* Google Docs link */}
              {docUrl && (
                <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-emerald-700" />
                    <span>Report exported to Google Doc structure!</span>
                  </div>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-emerald-600 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs hover:bg-emerald-700 transition"
                  >
                    <span>View Google Doc</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Detailed Evaluation Review */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <h5 className="text-xs font-bold font-sans text-gray-500 tracking-wider uppercase mb-2">Grade Review & Suggestions:</h5>
                <div className="markdown-body font-sans text-xs bg-white border border-gray-150 rounded-xl p-4 max-h-96 overflow-y-auto leading-relaxed text-gray-700 space-y-4 shadow-3xs select-text">
                  <ReactMarkdown>{result.detailedReview}</ReactMarkdown>
                </div>
              </div>
            </div>
          )
        ) : (
            <div className="h-full min-h-80 flex flex-col items-center justify-center text-center text-gray-405 py-12">
              <FileText size={40} className="text-gray-300" />
              <h4 className="text-sm font-semibold text-gray-700 font-sans mt-2">Waiting for essay composition submit</h4>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Compose your descriptive composition on the left-hand panel, then click verify. The AI descriptive essay evaluator will show detailed checklist reports here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
