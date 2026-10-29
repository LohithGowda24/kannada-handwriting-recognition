import React from 'react';
import { Cpu, BookOpen, BarChart3, Sparkles, Layers, Info, Download } from 'lucide-react';

interface HeaderProps {
  onOpenArchitecture: () => void;
  onOpenBenchmark: () => void;
  onOpenKagunitha: () => void;
  onOpenDownload: () => void;
  activeMode: 'canvas' | 'upload';
  setActiveMode: (mode: 'canvas' | 'upload') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenArchitecture,
  onOpenBenchmark,
  onOpenKagunitha,
  onOpenDownload,
  activeMode,
  setActiveMode,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-500/20 ring-1 ring-white/20">
              <span className="text-xl font-bold font-serif text-white">ಕ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Attention-Guided CNN–RNN Kannada HTR
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Low-Resource SOTA
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                High-Accuracy Handwritten Text Recognition for Dravidian Scripts • Spatial-Temporal Attention
              </p>
            </div>
          </div>

          {/* Action Tabs & Nav */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Input Mode Selector */}
            <div className="inline-flex p-1 bg-slate-800/90 rounded-lg border border-slate-700/80 text-xs">
              <button
                type="button"
                onClick={() => setActiveMode('canvas')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeMode === 'canvas'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ✏️ Digital Canvas
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('upload')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeMode === 'upload'
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                📷 Upload / Camera
              </button>
            </div>

            {/* Quick Tools */}
            <button
              type="button"
              onClick={onOpenArchitecture}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hover:border-indigo-500/50"
              title="Inspect CNN Backbone, Spatial Attention Gate, BiLSTM and Bahdanau Attention"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Architecture</span>
            </button>

            <button
              type="button"
              onClick={onOpenBenchmark}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hover:border-emerald-500/50"
              title="Benchmark metrics: CER, WER, and Low-Resource Ablations"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Evaluation</span>
            </button>

            <button
              type="button"
              onClick={onOpenKagunitha}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hover:border-amber-500/50"
              title="Kannada Alphabet, Kagunitha Matrix and Ottakshara conjunct guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Kagunitha Guide</span>
            </button>

            <button
              type="button"
              onClick={onOpenDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
              title="Download full project codebase as ZIP archive"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
