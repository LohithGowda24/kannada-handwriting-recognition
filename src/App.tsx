import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DrawingCanvas } from './components/DrawingCanvas';
import { ImageUploadCrop } from './components/ImageUploadCrop';
import { AttentionViewer } from './components/AttentionViewer';
import { RecognitionResults } from './components/RecognitionResults';
import { ArchitectureModal } from './components/ArchitectureModal';
import { BenchmarkSuite } from './components/BenchmarkSuite';
import { KagunithaReference } from './components/KagunithaReference';
import { DownloadModal } from './components/DownloadModal';
import { RecognitionResult } from './types/htr';
import { AlertCircle, Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import { BENCHMARK_SAMPLES } from './data/kannadaSamples';

export default function App() {
  const [activeMode, setActiveMode] = useState<'canvas' | 'upload'>('canvas');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [selectedCharIndex, setSelectedCharIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isKagunithaOpen, setIsKagunithaOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // Initialize with a default benchmark recognition on first load
  useEffect(() => {
    // Generate initial canvas state with first benchmark "ಕನ್ನಡ"
    const sample = BENCHMARK_SAMPLES[0];
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#fcfdfd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw faint ruled guides
      const centerY = canvas.height * 0.45;
      ctx.strokeStyle = '#e2e8f0';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, centerY - 50);
      ctx.lineTo(canvas.width - 10, centerY - 50);
      ctx.moveTo(10, centerY + 50);
      ctx.lineTo(canvas.width - 10, centerY + 50);
      ctx.stroke();

      ctx.strokeStyle = '#cbd5e1';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(10, centerY);
      ctx.lineTo(canvas.width - 10, centerY);
      ctx.stroke();

      // Render strokes
      ctx.strokeStyle = '#0f172a';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      sample.strokes.forEach((stroke) => {
        if (stroke.points.length < 2) return;
        ctx.lineWidth = stroke.width || 5;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
        for (let i = 1; i < stroke.points.length; i++) {
          const p1 = stroke.points[i - 1];
          const p2 = stroke.points[i];
          const midX = (p1[0] + p2[0]) / 2;
          const midY = (p1[1] + p2[1]) / 2;
          ctx.quadraticCurveTo(p1[0], p1[1], midX, midY);
        }
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last[0], last[1]);
        ctx.stroke();
      });

      const initialUrl = canvas.toDataURL('image/png');
      setCurrentImageSrc(initialUrl);

      // Default high-accuracy parsed result for initial demo
      setResult({
        recognizedText: 'ಕನ್ನಡ',
        transliteration: 'Kannaḍa',
        translation: 'The Kannada language, culture & heritage of Karnataka',
        confidence: 99.4,
        style: 'Fluid Cursive Ink (Compound Ligature)',
        readabilityScore: 92,
        segments: [
          {
            text: 'ಕನ್ನಡ',
            transliteration: 'Kannaḍa',
            box_2d: [180, 80, 780, 480],
            charBreakdown: [
              {
                akshara: 'ಕ',
                unicodeHex: 'U+0C95',
                components: ['Base consonant Ka (ಅಲ್ಪಪ್ರಾಣ ಕ)'],
                confidence: 99.8,
                attentionFocus: 'Loop closed at bottom, top horizontal bar intact',
                strokeType: 'consonant',
              },
              {
                akshara: 'ನ್ನ',
                unicodeHex: 'U+0CA8 U+0CCD U+0CA8',
                components: ['Base consonant Na', 'Virama (್)', 'Na-ottakshara subscript (್ನ)'],
                confidence: 99.1,
                attentionFocus: 'Spatial attention gate isolated bottom subscript loop',
                strokeType: 'ottakshara',
              },
              {
                akshara: 'ಡ',
                unicodeHex: 'U+0CA1',
                components: ['Retroflex consonant Da'],
                confidence: 99.3,
                attentionFocus: 'S-curve curvature and talakattu anchor',
                strokeType: 'consonant',
              },
            ],
          },
        ],
        attentionInsights: [
          '2D Spatial Attention Gate effectively isolated the subscript "್ನ" (Na-ottakshara) located 65px below the baseline, preventing it from being misread as a vowel diacritic.',
          'BiLSTM forward-backward transitions resolved the horizontal cursive connection between "ಕ" and the subsequent geminate ligature.',
          'Talakattu top-ticks are sharply attended, disambiguating from Devanagari or Telugu sister glyphs.',
        ],
        linguisticNotes: 'Word: ಕನ್ನಡ (IAST: Kannaḍa). Contains a classic geminate conjunct consonant (ದ್ವಿತ್ವ - Dvitva).',
      });
    }
  }, []);

  // Main Recognition Trigger
  const handleRecognize = async (dataUrl: string, promptHint = '') => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentImageSrc(dataUrl);

    try {
      const response = await fetch('/api/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: dataUrl,
          mode: 'standard',
          promptHint: promptHint,
        }),
      });

      const json = await response.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Recognition service encountered an error');
      }

      setResult(json.data);
      setSelectedCharIndex(0);
    } catch (err: any) {
      console.error('Recognition error:', err);
      setErrorMessage(err.message || 'Failed to communicate with recognition engine');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header */}
      <Header
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenKagunitha={() => setIsKagunithaOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Banner Alert if error */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-2xl text-xs text-rose-300 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-2 py-1 rounded bg-rose-900/50 hover:bg-rose-900 text-rose-200 text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Input Stage: Digital Canvas or Image Upload */}
        <section aria-label="Handwriting Input Area">
          {activeMode === 'canvas' ? (
            <DrawingCanvas onRecognize={handleRecognize} isLoading={isLoading} />
          ) : (
            <ImageUploadCrop onRecognize={handleRecognize} isLoading={isLoading} />
          )}
        </section>

        {/* Analysis & Results Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Attention Heatmap & Saliency Overlay */}
          <section aria-label="Attention Heatmap Visualizer">
            <AttentionViewer
              imageSrc={currentImageSrc}
              result={result}
              selectedCharIndex={selectedCharIndex}
              onSelectCharIndex={setSelectedCharIndex}
            />
          </section>

          {/* Right Column: Formatted Kannada Text & Akshara Breakdown */}
          <section aria-label="Recognition Results">
            <RecognitionResults
              result={result}
              isLoading={isLoading}
              onSelectCharIndex={setSelectedCharIndex}
              selectedCharIndex={selectedCharIndex}
            />
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Attention-Guided CNN–RNN</span>
            <span>•</span>
            <span>Low-Resource Kannada HTR</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Powered by 2D Spatial Attention Gating, BiLSTM Sequence Modeling & Gemini Vision Grounding
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <BenchmarkSuite
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      <KagunithaReference
        isOpen={isKagunithaOpen}
        onClose={() => setIsKagunithaOpen(false)}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

    </div>
  );
}
