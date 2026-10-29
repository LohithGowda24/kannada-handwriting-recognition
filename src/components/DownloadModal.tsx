import React, { useState } from 'react';
import { X, Download, Terminal, CheckCircle2, FolderArchive, Copy, Check, FileCode2, ExternalLink } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Download Full Project Codebase
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Run
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Download the complete source code, neural components, and backend as a ZIP archive
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-300 text-xs">
          
          {/* Main 1-Click Download Card */}
          <div className="p-4 bg-gradient-to-br from-amber-500/10 via-slate-900 to-indigo-950/20 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  kannada-htr-project.zip
                  <span className="text-[10px] font-mono text-amber-300 font-normal">Complete Source Code</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Includes all React UI, Express backend, Attention algorithms, TypeScript types, and README.
                </p>
              </div>
            </div>

            <a
              href="/api/download-project"
              download="kannada-htr-project.zip"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </a>
          </div>

          {/* Quick Setup Instructions */}
          <div className="space-y-3">
            <div className="font-semibold text-white text-xs flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>How to run this project on your local machine:</span>
            </div>

            {/* Step 1 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">1. Extract and install dependencies:</span>
                <button
                  type="button"
                  onClick={() => handleCopy('npm install', 'cmd1')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <pre className="p-2 bg-slate-900 rounded-lg text-amber-300 font-mono text-[11px]">
                npm install
              </pre>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">2. Configure API key in .env file:</span>
                <button
                  type="button"
                  onClick={() => handleCopy('cp .env.example .env', 'cmd2')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'cmd2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <pre className="p-2 bg-slate-900 rounded-lg text-slate-300 font-mono text-[11px]">
                cp .env.example .env
              </pre>
              <p className="text-[10px] text-slate-400">
                Open <code className="text-amber-400">.env</code> and insert your <code className="text-amber-400">GEMINI_API_KEY="..."</code> from Google AI Studio.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">3. Start the application:</span>
                <button
                  type="button"
                  onClick={() => handleCopy('npm run dev', 'cmd3')}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedCmd === 'cmd3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <pre className="p-2 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[11px]">
                npm run dev
              </pre>
              <p className="text-[10px] text-slate-400">
                Then open <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">http://localhost:3000</a> in your browser.
              </p>
            </div>
          </div>

          {/* Included Files Checklist */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-200 block text-xs">
              What's in the download package:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Express backend & Gemini routes (<code className="text-slate-300">server.ts</code>)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Spatial & Bahdanau attention code</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Digital stylus & canvas engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Pre-OCR filters (Otsu & Thinning)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Kannada linguistics & Unicode tables</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Complete README documentation</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
