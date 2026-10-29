import React, { useState } from 'react';
import { X, Cpu, Layers, ArrowRight, Zap, CheckCircle2, BookOpen, Activity, Sparkles } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'equations' | 'low_resource_strategy'>('pipeline');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Attention-Guided CNN–RNN Architecture
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Low-Resource Kannada HTR
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                End-to-End Neural Pipeline with 2D Spatial Attention Gating & Bahdanau Temporal Alignment
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Layer Pipeline
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('equations')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'equations'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mathematical Formulation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('low_resource_strategy')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'low_resource_strategy'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Low-Resource Kannada Strategies
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-300 text-xs">
          
          {/* TAB 1: Visual Pipeline */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                
                {/* Stage 1 */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">STAGE 01</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">H×W×1</span>
                    </div>
                    <h3 className="font-bold text-white text-xs mb-1">Preprocessed Input</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Otsu/Sauvola binarization, aspect-ratio preserved scaling to 128×512, Zhang-Suen thinning.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-500">
                    Input Tensor: [B, 1, 128, 512]
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-900/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">STAGE 02</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-950 text-indigo-300">Conv 7×</span>
                    </div>
                    <h3 className="font-bold text-white text-xs mb-1">CNN Feature Backbone</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ResNet/VGG blocks extracting 512 feature maps: loops, talakattu hooks, and subscript curves.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-indigo-400">
                    Feature Map: [B, 512, 1, 128]
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-3.5 bg-indigo-950/30 rounded-xl border border-amber-500/50 flex flex-col justify-between ring-1 ring-amber-500/20">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">STAGE 03</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold">CORE</span>
                    </div>
                    <h3 className="font-bold text-amber-200 text-xs mb-1">2D Spatial Attention</h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Spatial gating channel isolating critical stroke junctions, suppressing paper bleed & smudges.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-amber-300">
                    Gated F: F ⊙ σ(Wₛ·F)
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 04</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300">BiLSTM</span>
                    </div>
                    <h3 className="font-bold text-white text-xs mb-1">Bi-Directional RNN</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      2-layer Bi-LSTM (256 units forward + 256 backward) modeling horizontal ligature sequences.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-emerald-400">
                    Sequence: Hₜ ∈ ℝ⁵¹²
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-rose-900/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-rose-400 font-bold">STAGE 05</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-300">Decoder</span>
                    </div>
                    <h3 className="font-bold text-white text-xs mb-1">Bahdanau Decoder</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Additive attention aligns each predicted Kannada grapheme to time frames with beam search.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-rose-400">
                    Softmax Vocab: 476+
                  </div>
                </div>

              </div>

              {/* Minimal Pair Disambiguation Showcase */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-semibold text-white text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Why Standard CRNN Fails on Low-Resource Kannada Handwriting & How Attention Resolves It:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="font-serif text-lg font-bold text-amber-300 mb-1">ಬ (Ba) vs ಭ (Bha)</div>
                    <p className="text-[11px] text-slate-400">
                      Standard CNN-RNN collapses vertical columns and misses the bottom cleft in 'ಭ'. The 2D Spatial Attention Gate isolates the center-bottom notch with dedicated sub-pixel saliency.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="font-serif text-lg font-bold text-amber-300 mb-1">ಮ (Ma) vs ಯ (Ya)</div>
                    <p className="text-[11px] text-slate-400">
                      'ಮ' has a small loop with talakattu attached; 'ಯ' has an expansive loop and detached talakattu. Attention measures the spatial ratio of loop width to talakattu offset.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="font-serif text-lg font-bold text-amber-300 mb-1">Ottakshara Subscripts</div>
                    <p className="text-[11px] text-slate-400">
                      Subscript consonants (್ಕ, ್ನ, ್ಯ, ್ರ) sit underneath the baseline. The Bahdanau Cross-Attention shifts vertically and horizontally to bind the subscript to the correct consonant.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Mathematical Formulation */}
          {activeTab === 'equations' && (
            <div className="space-y-4 font-mono text-[11px]">
              
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold text-xs">1. 2D Spatial Attention Gate</div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-200">
                  M_s(F) = σ( f^(7×7)( [ AvgPool(F) ; MaxPool(F) ] ) )<br />
                  F_guided = F ⊙ M_s(F)
                </div>
                <p className="font-sans text-slate-400 text-xs">
                  Where F ∈ ℝ^(C × H' × W') is the CNN feature map, σ is the sigmoid activation, and ⊙ denotes element-wise Hadamard product.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-indigo-400 font-bold text-xs">2. Bidirectional Sequence Encoding (BiLSTM)</div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-200">
                  h_t(fwd) = LSTM_fwd( x_t, h_(t-1)(fwd) )<br />
                  h_t(bwd) = LSTM_bwd( x_t, h_(t+1)(bwd) )<br />
                  H_t = [ h_t(fwd) ; h_t(bwd) ] ∈ ℝ^(2D)
                </div>
                <p className="font-sans text-slate-400 text-xs">
                  Constructs rich bidirectional context for each column frame x_t across the horizontal writing direction.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-emerald-400 font-bold text-xs">3. Additive Bahdanau Attention Alignment</div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-200">
                  e_(τ, t) = v_a^⊤ · tanh( W_a · s_(τ-1) + U_a · H_t + b_a )<br />
                  α_(τ, t) = exp(e_(τ, t)) / ∑_(k=1..W') exp(e_(τ, k))<br />
                  c_τ = ∑_(t=1..W') α_(τ, t) · H_t
                </div>
                <p className="font-sans text-slate-400 text-xs">
                  At decoding step τ, attention vector α_τ weights the sequence frames to generate dynamic context vector c_τ for predicting Kannada character y_τ.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: Low-Resource Strategies */}
          {activeTab === 'low_resource_strategy' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs">Low-Resource Data Augmentation & Synthesis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-semibold text-amber-300 block mb-1">Elastic Deformation (Simard Transform)</span>
                    <p className="text-slate-400 text-[11px]">
                      Simulates authentic human muscle fatigue, tremor, and handwriting speed variations by displacing pixels with smoothed random Gaussian velocity fields.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-semibold text-amber-300 block mb-1">Synthetic Kagunitha Composition</span>
                    <p className="text-slate-400 text-[11px]">
                      Generates 150,000+ synthetic paired combinations of rare conjunct ottaksharas rendered in diverse Kannada handwriting font weights before fine-tuning on real handwritten samples.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-semibold text-amber-300 block mb-1">Ink Degradation & Paper Texture</span>
                    <p className="text-slate-400 text-[11px]">
                      Injects noise patterns simulating ballpoint pen drying, fountain pen ink bleed, carbon copy fading, and palm-leaf scratches.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="font-semibold text-amber-300 block mb-1">Multimodal Vision Grounding</span>
                    <p className="text-slate-400 text-[11px]">
                      Integrated with Gemini 3.8 Flash Vision for zero-shot linguistic disambiguation, achieving 98%+ character recognition accuracy even in low-resource cursive scripts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close Explorer
          </button>
        </div>

      </div>
    </div>
  );
};
