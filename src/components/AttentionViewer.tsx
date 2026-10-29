import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Layers, 
  Sliders, 
  Crosshair, 
  Activity, 
  Sparkles, 
  ZoomIn, 
  Info,
  Maximize2
} from 'lucide-react';
import { RecognitionResult, Segment } from '../types/htr';
import { generateAttentionMaps, renderAttentionHeatmap, SpatialTemporalAttention } from '../utils/attentionSimulation';

interface AttentionViewerProps {
  imageSrc: string | null;
  result: RecognitionResult | null;
  selectedCharIndex: number;
  onSelectCharIndex: (idx: number) => void;
}

export const AttentionViewer: React.FC<AttentionViewerProps> = ({
  imageSrc,
  result,
  selectedCharIndex,
  onSelectCharIndex,
}) => {
  const [viewMode, setViewMode] = useState<'heat_char' | 'heat_spatial' | 'bounding_boxes' | 'feature_maps'>('heat_char');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);
  const [colorScheme, setColorScheme] = useState<'thermal' | 'amber' | 'emerald'>('thermal');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Split recognized text into characters/aksharas
  const characters = result ? Array.from(result.recognizedText.replace(/\s+/g, '')) : [];

  // Generate simulated or computed spatial-temporal attention maps
  const [attentionData, setAttentionData] = useState<SpatialTemporalAttention | null>(null);

  useEffect(() => {
    if (!result || characters.length === 0) {
      setAttentionData(null);
      return;
    }

    // Extract segments bounding boxes
    const boundingBoxes = result.segments?.map((s) => ({
      ymin: s.box_2d[0],
      xmin: s.box_2d[1],
      ymax: s.box_2d[2],
      xmax: s.box_2d[3],
    }));

    const maps = generateAttentionMaps(characters, 800, 320, 32, 16, boundingBoxes);
    setAttentionData(maps);
  }, [result]);

  // Render combined image and attention overlay onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 320;

      // Draw background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw user's handwritten image scaled properly
      ctx.save();
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.restore();

      // If no attention data or raw image, return
      if (!attentionData) return;

      // Render overlay based on active view mode
      if (viewMode === 'heat_char') {
        const activeMap = attentionData.heatmaps[selectedCharIndex] || attentionData.heatmaps[0];
        if (activeMap) {
          renderAttentionHeatmap(ctx, canvas.width, canvas.height, activeMap.weights, heatmapOpacity, colorScheme);

          // Draw focus focal box outline
          const fb = activeMap.focusBox;
          ctx.save();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(
            fb.xmin * canvas.width,
            fb.ymin * canvas.height,
            (fb.xmax - fb.xmin) * canvas.width,
            (fb.ymax - fb.ymin) * canvas.height
          );
          ctx.restore();
        }
      } else if (viewMode === 'heat_spatial') {
        // Combined 2D spatial attention gate across all features
        const combinedWeights: number[][] = [];
        const rows = attentionData.gridHeight;
        const cols = attentionData.gridWidth;

        for (let r = 0; r < rows; r++) {
          combinedWeights[r] = [];
          for (let c = 0; c < cols; c++) {
            let maxW = 0;
            attentionData.heatmaps.forEach((hm) => {
              maxW = Math.max(maxW, hm.weights[r][c]);
            });
            combinedWeights[r][c] = maxW;
          }
        }
        renderAttentionHeatmap(ctx, canvas.width, canvas.height, combinedWeights, heatmapOpacity, colorScheme);
      } else if (viewMode === 'bounding_boxes' && result?.segments) {
        // Draw segmented word/character bounding boxes
        result.segments.forEach((seg, idx) => {
          const [ymin, xmin, ymax, xmax] = seg.box_2d;
          const bx = (xmin / 1000) * canvas.width;
          const by = (ymin / 1000) * canvas.height;
          const bw = ((xmax - xmin) / 1000) * canvas.width;
          const bh = ((ymax - ymin) / 1000) * canvas.height;

          ctx.save();
          ctx.strokeStyle = idx % 2 === 0 ? '#06b6d4' : '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);

          ctx.fillStyle = idx % 2 === 0 ? 'rgba(6, 182, 212, 0.2)' : 'rgba(245, 158, 11, 0.2)';
          ctx.fillRect(bx, by, bw, bh);

          // Label
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 12px sans-serif';
          const label = `${seg.text} (${seg.transliteration})`;
          const textWidth = ctx.measureText(label).width;

          ctx.fillStyle = idx % 2 === 0 ? '#06b6d4' : '#f59e0b';
          ctx.fillRect(bx, Math.max(0, by - 18), textWidth + 10, 18);

          ctx.fillStyle = '#0f172a';
          ctx.fillText(label, bx + 5, Math.max(14, by - 4));
          ctx.restore();
        });
      } else if (viewMode === 'feature_maps') {
        // Multi-channel CNN filter visualization overlay
        ctx.save();
        ctx.globalAlpha = 0.35;
        // Draw grid overlay resembling feature channels
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 0.5;
        const cellW = canvas.width / 16;
        const cellH = canvas.height / 8;
        for (let i = 0; i <= 16; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cellW, 0);
          ctx.lineTo(i * cellW, canvas.height);
          ctx.stroke();
        }
        for (let j = 0; j <= 8; j++) {
          ctx.beginPath();
          ctx.moveTo(0, j * cellH);
          ctx.lineTo(canvas.width, j * cellH);
          ctx.stroke();
        }
        ctx.restore();
      }
    };
    img.src = imageSrc;
  }, [imageSrc, attentionData, selectedCharIndex, viewMode, heatmapOpacity, colorScheme, result]);

  // Current active character attention profile
  const activeCharMap = attentionData?.heatmaps[selectedCharIndex];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      
      {/* Header & Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            Attention Heatmap & Spatial-Temporal Saliency
          </h2>
          <p className="text-xs text-slate-400">
            Visualizing CNN convolutional feature gating and BiLSTM Bahdanau decoder alignments.
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="inline-flex p-1 bg-slate-800/90 rounded-lg border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('heat_char')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'heat_char'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Character Attention
          </button>
          <button
            type="button"
            onClick={() => setViewMode('heat_spatial')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'heat_spatial'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2D Spatial Gate
          </button>
          <button
            type="button"
            onClick={() => setViewMode('bounding_boxes')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'bounding_boxes'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bounding Segments
          </button>
          <button
            type="button"
            onClick={() => setViewMode('feature_maps')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              viewMode === 'feature_maps'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CNN Channels
          </button>
        </div>
      </div>

      {/* Main Attention Canvas Stage */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex justify-center shadow-inner">
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          className="w-full max-w-[800px] h-[240px] sm:h-[300px] object-contain"
        />

        {/* Legend Overlay */}
        <div className="absolute bottom-2.5 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-2 rounded bg-gradient-to-r from-purple-800 via-cyan-400 via-amber-400 to-red-600" />
            <span className="font-mono text-[10px] text-slate-400">Attention Energy</span>
          </div>
          {activeCharMap && viewMode === 'heat_char' && (
            <div className="border-l border-slate-700 pl-2 font-mono text-amber-300">
              Focus: <span className="font-bold font-serif text-sm">'{activeCharMap.char}'</span> (Step {selectedCharIndex + 1})
            </div>
          )}
        </div>
      </div>

      {/* Character Selector Pills (Click to inspect attention spotlight) */}
      {characters.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              Click any recognized akshara to view its temporal-spatial attention spotlight:
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {characters.length} grapheme steps
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
            {characters.map((ch, idx) => {
              const isSelected = selectedCharIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectCharIndex(idx);
                    if (viewMode !== 'heat_char') setViewMode('heat_char');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-serif text-base font-bold transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400/50 scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>{ch}</span>
                  <span className={`text-[10px] font-sans font-normal ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>
                    #{idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls: Opacity Slider, Color Scheme, and Temporal Alignment curve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-800 text-xs">
        
        {/* Sliders & Color */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-400 font-medium">Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="font-mono text-slate-300 w-8 text-right">
              {Math.round(heatmapOpacity * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <span className="text-slate-400">Palette:</span>
            <button
              type="button"
              onClick={() => setColorScheme('thermal')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                colorScheme === 'thermal' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Turbo
            </button>
            <button
              type="button"
              onClick={() => setColorScheme('amber')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                colorScheme === 'amber' ? 'bg-amber-500 text-slate-950 font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Amber
            </button>
            <button
              type="button"
              onClick={() => setColorScheme('emerald')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                colorScheme === 'emerald' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Emerald
            </button>
          </div>
        </div>

        {/* Bahdanau Temporal Alignment Mini Waveform */}
        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-semibold text-slate-200 text-[11px]">Bahdanau Temporal Alignment</div>
              <div className="text-[10px] text-slate-400">Decoder alignment across sequence length W'</div>
            </div>
          </div>

          {activeCharMap && (
            <div className="flex items-end gap-0.5 h-6 w-32 border-b border-slate-700">
              {activeCharMap.temporalCurve.map((val, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.max(10, val * 100)}%` }}
                  className={`flex-1 rounded-t-sm transition-all ${
                    val > 0.6 ? 'bg-amber-400' : val > 0.3 ? 'bg-indigo-400' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
