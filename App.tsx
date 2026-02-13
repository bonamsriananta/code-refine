import React, { useState, useRef, useEffect } from 'react';
import { Play, Bug, Zap, Shield, Sparkles, AlertCircle, Copy, Check } from 'lucide-react';
import { AnalysisType } from './types';
import { PROMPTS } from './constants';
import { streamCodeAnalysis } from './services/geminiService';
import { Button } from './components/Button';
import { AnalysisView } from './components/AnalysisView';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeAnalysisType, setActiveAnalysisType] = useState<AnalysisType>(AnalysisType.GENERAL_REVIEW);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("Please enter some code to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult('');
    setError(null);

    // Scroll to results on mobile after clicking analyze
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        document.getElementById('analysis-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    try {
      await streamCodeAnalysis(
        code,
        PROMPTS[activeAnalysisType],
        (chunk) => {
          setAnalysisResult((prev) => prev + chunk);
        }
      );
    } catch (err: any) {
      console.error(err);
      // Improved error handling to show specific API issues
      const errorMessage = err.message || err.toString();
      
      if (errorMessage.includes('429') || errorMessage.includes('Quota')) {
        setError("Rate limit exceeded (429). The free tier quota has been exhausted. Please wait a moment or use a paid API key.");
      } else if (errorMessage.includes('403')) {
        setError(`Access Denied (403). Your API key may not have permissions for this model or location. Details: ${errorMessage}`);
      } else if (errorMessage.includes('400')) {
        setError(`Bad Request (400). Please check your API key and input. Details: ${errorMessage}`);
      } else {
        setError(`Analysis failed: ${errorMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisResult);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Simple auto-indent for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      
      e.currentTarget.value = value.substring(0, start) + "  " + value.substring(end);
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CodeRefine</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-400">Ready</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden lg:max-h-[calc(100vh-64px)]">
        
        {/* Left Panel: Code Input */}
        <div className="flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0f172a] h-[500px] lg:h-auto lg:flex-1">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-surface/30">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-blue-500"></span>
              Source Code
            </h2>
            <div className="text-xs text-slate-500 font-mono">
              {code.length} chars
            </div>
          </div>
          
          <div className="relative flex-1 group">
             <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="// Paste your code here..."
              className="absolute inset-0 w-full h-full bg-[#0f172a] text-slate-300 font-mono text-sm p-6 resize-none focus:outline-none leading-6 placeholder:text-slate-600"
              spellCheck={false}
            />
          </div>

          <div className="px-6 py-4 border-t border-slate-800 bg-surface/30 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {Object.values(AnalysisType).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveAnalysisType(type)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border ${
                      activeAnalysisType === type 
                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                        : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
             </div>
             
             <Button 
                onClick={handleAnalyze} 
                isLoading={isAnalyzing} 
                disabled={!code.trim()}
                icon={<Play className="w-4 h-4 fill-current" />}
                className="w-full sm:w-auto"
              >
                Analyze
             </Button>
          </div>
        </div>

        {/* Right Panel: Analysis Output */}
        <div id="analysis-panel" className="flex flex-col min-w-0 bg-[#111827] min-h-[500px] lg:h-auto lg:flex-1">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-surface/30">
            <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-accent"></span>
              Analysis Results
            </h2>
            <div className="flex items-center gap-2">
              {analysisResult && (
                <button 
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 transition-colors"
                  title="Copy Analysis"
                >
                  {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative min-h-[400px]">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
                   <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                   <h3 className="text-red-400 font-medium mb-1">Analysis Failed</h3>
                   <p className="text-red-300/80 text-sm break-words">{error}</p>
                   <button 
                     onClick={() => setError(null)}
                     className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
                   >
                     Dismiss
                   </button>
                </div>
              </div>
            ) : (
              <AnalysisView content={analysisResult} isLoading={isAnalyzing} />
            )}
          </div>
          
          {/* Status Bar */}
          <div className="px-6 py-2 border-t border-slate-800 bg-surface/30 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-medium">
             <span>Model: gemini-3-flash-preview</span>
             <span>Status: {isAnalyzing ? 'Processing...' : 'Ready'}</span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;