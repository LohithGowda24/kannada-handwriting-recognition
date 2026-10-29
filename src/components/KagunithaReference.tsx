import React, { useState } from 'react';
import { X, BookOpen, Copy, Check, Sparkles, Send } from 'lucide-react';
import { KANNADA_SWARAGALU, KANNADA_VYANJANAGALU, KANNADA_NUMERALS } from '../utils/kannadaLinguistics';

interface KagunithaReferenceProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter?: (char: string) => void;
}

const MATRA_SIGNS = [
  { name: 'ಅ (Hrasva)', sign: '', suffix: 'a' },
  { name: 'ಆ (Dīrgha)', sign: 'ಾ', suffix: 'ā' },
  { name: 'ಇ (Gudisu)', sign: 'ಿ', suffix: 'i' },
  { name: 'ಈ (Gudisu Deergha)', sign: 'ೀ', suffix: 'ī' },
  { name: 'ಉ (Kombu)', sign: 'ು', suffix: 'u' },
  { name: 'ಊ (Kombu Deergha)', sign: 'ೂ', suffix: 'ū' },
  { name: 'ಋ (Vattusuli)', sign: 'ೃ', suffix: 'ṛ' },
  { name: 'ಎ (Ettva)', sign: 'ೆ', suffix: 'e' },
  { name: 'ಏ (Ettva Deergha)', sign: 'ೇ', suffix: 'ē' },
  { name: 'ಐ (Aitva)', sign: 'ೈ', suffix: 'ai' },
  { name: 'ಒ (Ottva)', sign: 'ೊ', suffix: 'o' },
  { name: 'ಓ (Ottva Deergha)', sign: 'ೋ', suffix: 'ō' },
  { name: 'ಔ (Autva)', sign: 'ೌ', suffix: 'au' },
  { name: 'ಅಂ (Anusvara)', sign: 'ಂ', suffix: 'aṁ' },
  { name: 'ಅಃ (Visarga)', sign: 'ಃ', suffix: 'aḥ' },
];

export const KagunithaReference: React.FC<KagunithaReferenceProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
}) => {
  const [selectedConsonant, setSelectedConsonant] = useState<string>('ಕ');
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (char: string) => {
    navigator.clipboard.writeText(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(null), 1500);
    if (onSelectCharacter) onSelectCharacter(char);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Kannada Script & Kagunitha Guide
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ಅಕ್ಷರಮಾಲೆ (Aksharamāle)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Swaragalu, Vyanjanagalu, Ottakshara, and Gunithakshara combinations reference
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
        <div className="p-5 overflow-y-auto space-y-6 text-slate-300 text-xs">
          
          {/* Swaragalu (Vowels) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ಸ್ವರಗಳು (Swaragalu - Vowels)
              </span>
              <span className="text-[11px] text-slate-500">15 Primary Vowels</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-1.5">
              {KANNADA_SWARAGALU.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCopy(s.char)}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/80 hover:bg-slate-800 transition-all text-center group"
                >
                  <span className="font-serif text-xl font-bold text-white group-hover:text-amber-300 block">
                    {s.char}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {s.iast}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Vyanjanagalu (Consonants) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                ವ್ಯಂಜನಗಳು (Vyanjanagalu - Consonants)
              </span>
              <span className="text-[11px] text-slate-500">Click to preview Kagunitha series below</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-12 gap-1.5">
              {KANNADA_VYANJANAGALU.map((v, idx) => {
                const isSelected = selectedConsonant === v.char;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedConsonant(v.char);
                      handleCopy(v.char);
                    }}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <span className="font-serif text-xl font-bold block">
                      {v.char}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {v.iast}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Kagunitha Matrix for selected consonant */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300 text-xs flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                ಕಾಗುಣಿತ (Kagunitha Series for: <span className="font-serif text-lg font-bold text-white">{selectedConsonant}</span>)
              </span>
              <span className="text-[11px] text-slate-400">Click any combination to copy</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
              {MATRA_SIGNS.map((matra, idx) => {
                // If sign is empty, it's the base letter
                const combined = matra.sign === '' ? selectedConsonant : `${selectedConsonant}${matra.sign}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCopy(combined)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/80 hover:bg-slate-800 transition-all text-center group"
                  >
                    <span className="font-serif text-2xl font-bold text-white group-hover:text-amber-300 block mb-0.5">
                      {combined}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {matra.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kannada Numerals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                ಕನ್ನಡ ಅಂಕಿಗಳು (Kannada Numerals)
              </span>
              <span className="text-[11px] text-slate-500">0 to 9</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {KANNADA_NUMERALS.map((num, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCopy(num.char)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/80 hover:bg-slate-800 transition-all text-center group"
                >
                  <span className="font-serif text-2xl font-bold text-white group-hover:text-emerald-300 block">
                    {num.char}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {num.digit} ({num.name})
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {copiedChar ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Copied '{copiedChar}' to clipboard
              </span>
            ) : (
              'Click any character to copy to clipboard'
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
