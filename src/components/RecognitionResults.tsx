import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Share2, 
  Download, 
  FileText, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Code
} from 'lucide-react';
import { RecognitionResult } from '../types/htr';
import { decomposeKannadaWord } from '../utils/kannadaLinguistics';

interface RecognitionResultsProps {
  result: RecognitionResult | null;
  isLoading: boolean;
  onSelectCharIndex: (idx: number) => void;
  selectedCharIndex: number;
}

export const RecognitionResults: React.FC<RecognitionResultsProps> = ({
  result,
  isLoading,
  onSelectCharIndex,
  selectedCharIndex,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'decomposition' | 'attention_insights' | 'json'>('overview');
  const [fontSize, setFontSize] = useState<'md' | 'lg' | 'xl'>('lg');

  // Copy recognized Kannada text
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.recognizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download recognized text as .txt file
  const handleDownload = () => {
    if (!result) return;
    const content = `Kannada Recognized Text: ${result.recognizedText}
Transliteration: ${result.transliteration}
Translation: ${result.translation || 'N/A'}
Confidence: ${result.confidence}%
Handwriting Style: ${result.style}

Linguistic Notes:
${result.linguisticNotes || ''}

Attention Insights:
${result.attentionInsights?.join('\n') || ''}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kannada-htr-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Play synthesized native Kannada speech
  const handlePlayPronunciation = async () => {
    if (!result || !result.recognizedText) return;
    setAudioError(null);
    setIsPlayingAudio(true);

    try {
      const resp = await fetch('/api/pronounce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.recognizedText }),
      });

      const data = await resp.json();
      if (!data.success || !data.audioBase64) {
        throw new Error(data.error || 'Speech synthesis failed');
      }

      // Play audio from base64 WAV
      const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setAudioError('Failed to play synthesized audio');
      };
      await audio.play();
    } catch (err: any) {
      console.error('Audio playback error:', err);
      // Fallback: Web Speech API if supported
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(result.recognizedText);
        utterance.lang = 'kn-IN';
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => {
          setIsPlayingAudio(false);
          setAudioError(err.message || 'Audio playback error');
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
        setAudioError(err.message || 'Audio not available');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px] text-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-serif text-lg font-bold text-amber-400">
            ಕ
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Extracting Low-Resource Kannada Handwriting</h3>
          <p className="text-xs text-slate-400 max-w-md">
            Processing CNN feature maps, 2D spatial attention filters, and BiLSTM Bahdanau cross-attention sequence alignments...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px] text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">No Handwriting Recognized Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Draw Kannada letters or words on the Digital Canvas, or upload an image above, then click 'Run Attention-Guided Recognition'.
        </p>
      </div>
    );
  }

  // Akshara decomposition breakdown
  const decomposedAksharas = decomposeKannadaWord(result.recognizedText);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col gap-5">
      
      {/* Top Banner: Confidence, Style, & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Confidence Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confidence: {result.confidence}%</span>
          </div>

          {/* Style Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span className="text-slate-500">Style:</span>
            <span>{result.style}</span>
          </div>

          {result.readabilityScore && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <span>Readability: {result.readabilityScore}/100</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePlayPronunciation}
            disabled={isPlayingAudio}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors disabled:opacity-50"
            title="Listen to native Kannada pronunciation (Gemini TTS)"
          >
            {isPlayingAudio ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span>Pronounce</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Copy Kannada text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
            title="Download text file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {audioError && (
        <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{audioError}</span>
        </div>
      )}

      {/* Primary Result Display: Kannada Unicode Text */}
      <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-inner flex flex-col gap-3">
        
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Extracted Kannada Unicode
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500">Size:</span>
            {(['md', 'lg', 'xl'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFontSize(s)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                  fontSize === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Large Text */}
        <div
          className={`font-serif font-bold text-white tracking-wide leading-relaxed select-all ${
            fontSize === 'xl' ? 'text-4xl sm:text-5xl' : fontSize === 'lg' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
          }`}
        >
          {result.recognizedText}
        </div>

        {/* Transliteration & English Meaning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Phonetic Transliteration (IAST / Latin):
            </span>
            <p className="text-sm font-medium text-amber-300 font-mono mt-0.5">
              {result.transliteration}
            </p>
          </div>

          {result.translation && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                English Translation / Meaning:
              </span>
              <p className="text-sm font-medium text-slate-200 mt-0.5">
                "{result.translation}"
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Tabs: Akshara Breakdown, Attention Insights, JSON */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`pb-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Akshara Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('attention_insights')}
          className={`pb-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'attention_insights'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Attention Insights ({result.attentionInsights?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('json')}
          className={`pb-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'json'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Raw Model JSON
        </button>
      </div>

      {/* Tab Content: Akshara Decomposition */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-slate-400">
            Detailed linguistic composition: Base Consonant, Vowel Matra, Subscript Ottakshara, and Unicode code points.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {decomposedAksharas.map((item, idx) => {
              const isSelected = selectedCharIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectCharIndex(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/80 ring-1 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-2xl font-bold text-white">
                      {item.akshara}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.unicodeHex}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    {item.components.map((comp, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="capitalize text-slate-400 font-mono">
                      Type: {item.strokeType}
                    </span>
                    <span className="text-emerald-400 font-semibold font-mono">
                      {item.confidence}% match
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Attention Insights */}
      {activeTab === 'attention_insights' && (
        <div className="space-y-2.5">
          <div className="text-xs text-slate-400">
            How the Attention-Guided neural backbone resolved ambiguities in low-resource Kannada handwriting:
          </div>
          {result.attentionInsights?.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
            >
              <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{insight}</p>
            </div>
          ))}

          {result.linguisticNotes && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 mt-3 space-y-1">
              <span className="font-semibold block text-amber-300">Linguistic Context:</span>
              <p className="text-slate-300 leading-relaxed">{result.linguisticNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: JSON */}
      {activeTab === 'json' && (
        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-72">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

    </div>
  );
};
