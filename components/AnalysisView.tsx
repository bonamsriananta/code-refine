import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AnalysisViewProps {
  content: string;
  isLoading: boolean;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ content, isLoading }) => {
  if (!content && !isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h3 className="text-xl font-medium mb-2">Ready to Analyze</h3>
        <p className="max-w-xs text-sm">Paste your code on the left and select an analysis type to get started.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6 prose prose-invert prose-slate max-w-none">
       {/* Use ReactMarkdown to safely render the Markdown output from Gemini */}
      <ReactMarkdown
        components={{
          code({node, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <div className="relative group rounded-md overflow-hidden my-4 border border-slate-700 bg-[#0d1117]">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700 text-xs text-slate-400">
                   <span>{match[1]}</span>
                </div>
                <div className="p-4 overflow-x-auto">
                    <code className={`${className} font-mono text-sm`} {...props}>
                        {children}
                    </code>
                </div>
              </div>
            ) : (
              <code className="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-blue-200 font-mono" {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
      {isLoading && (
         <div className="flex items-center gap-2 text-blue-400 mt-4 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-sm font-medium">Analyzing code structure...</span>
         </div>
      )}
    </div>
  );
};