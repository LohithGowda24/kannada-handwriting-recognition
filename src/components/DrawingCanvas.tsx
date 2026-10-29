import React, { useRef, useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Trash2, 
  Play, 
  Sparkles, 
  PenTool, 
  Sliders, 
  CheckCircle,
  HelpCircle,
  Eraser,
  Undo2,
  Redo2,
  Maximize2
} from 'lucide-react';
import { KannadaSample, PreprocessingOptions } from '../types/htr';
import { BENCHMARK_SAMPLES } from '../data/kannadaSamples';
import { applyPreprocessing } from '../utils/imageProcessing';

interface DrawingCanvasProps {
  onRecognize: (dataUrl: string, promptHint?: string) => void;
  isLoading: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onRecognize,
  isLoading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penWidth, setPenWidth] = useState<number>(6);
  const [penColor, setPenColor] = useState<string>('#0f172a');
  const [isEraser, setIsEraser] = useState(false);
  const [paperStyle, setPaperStyle] = useState<'white' | 'ruled' | 'slate' | 'palm'>('ruled');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [showPreproc, setShowPreproc] = useState(false);
  const [preprocOptions, setPreprocOptions] = useState<PreprocessingOptions>({
    grayscale: false,
    binarize: false,
    threshold: 128,
    invert: false,
    enhanceContrast: false,
    denoise: false,
    skeletonize: false,
  });

  // Track coordinates for smooth stroke drawing
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas with proper background
    drawCanvasBackground(ctx, canvas.width, canvas.height, paperStyle);
    saveState();
  }, [paperStyle]);

  // Save canvas state for Undo / Redo
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(data);
    // Limit history stack
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCanvasBackground(ctx, canvas.width, canvas.height, paperStyle);
    saveState();
    setSelectedSample('');
  };

  // Draw background texture & guidelines
  const drawCanvasBackground = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    style: 'white' | 'ruled' | 'slate' | 'palm'
  ) => {
    ctx.save();
    if (style === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else if (style === 'ruled') {
      ctx.fillStyle = '#fcfdfd';
      ctx.fillRect(0, 0, w, h);

      // Kannada script guidelines:
      // Ascender line (Talakattu), Center baseline, Descender line (Ottakshara)
      const centerY = h * 0.45;
      const ascenderY = centerY - 50;
      const descenderY = centerY + 50;

      // Top guide
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(10, ascenderY);
      ctx.lineTo(w - 10, ascenderY);
      ctx.stroke();

      // Center main rule
      ctx.strokeStyle = '#cbd5e1';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(10, centerY);
      ctx.lineTo(w - 10, centerY);
      ctx.stroke();

      // Subscript / Ottakshara guide
      ctx.strokeStyle = '#e2e8f0';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, descenderY);
      ctx.lineTo(w - 10, descenderY);
      ctx.stroke();
    } else if (style === 'slate') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);
      // Faint slate texture
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(10, h * 0.5);
      ctx.lineTo(w - 10, h * 0.5);
      ctx.stroke();
    } else if (style === 'palm') {
      // Ancient palm-leaf manuscript texture
      ctx.fillStyle = '#f5ecd7';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#e2cb9d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.35);
      ctx.lineTo(w, h * 0.35);
      ctx.moveTo(0, h * 0.65);
      ctx.lineTo(w, h * 0.65);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Drawing event handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    lastPoint.current = coords;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, (isEraser ? penWidth * 2 : penWidth) / 2, 0, Math.PI * 2);
    ctx.fillStyle = isEraser ? (paperStyle === 'slate' ? '#1e293b' : paperStyle === 'palm' ? '#f5ecd7' : '#ffffff') : (paperStyle === 'slate' ? '#f8fafc' : penColor);
    ctx.fill();
    ctx.restore();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint.current) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = isEraser ? penWidth * 2.5 : penWidth;
    ctx.strokeStyle = isEraser
      ? paperStyle === 'slate'
        ? '#1e293b'
        : paperStyle === 'palm'
        ? '#f5ecd7'
        : '#ffffff'
      : paperStyle === 'slate'
      ? '#f8fafc'
      : penColor;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    // Quadratic bezier curve smoothing
    const midX = (lastPoint.current.x + coords.x) / 2;
    const midY = (lastPoint.current.y + coords.y) / 2;
    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midX, midY);
    ctx.stroke();
    ctx.restore();

    lastPoint.current = coords;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPoint.current = null;
      saveState();
    }
  };

  // Load a pre-configured realistic benchmark Kannada handwriting sample
  const handleLoadSample = (sample: KannadaSample) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setSelectedSample(sample.id);
    drawCanvasBackground(ctx, canvas.width, canvas.height, paperStyle);

    ctx.save();
    ctx.strokeStyle = paperStyle === 'slate' ? '#f8fafc' : penColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    sample.strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.lineWidth = stroke.width || penWidth;
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

    ctx.restore();
    saveState();
  };

  // Run recognition on canvas
  const triggerRecognition = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Optional hint if sample selected
    const sample = BENCHMARK_SAMPLES.find((s) => s.id === selectedSample);
    const hint = sample ? `Sample: ${sample.title} (${sample.description})` : '';

    const dataUrl = canvas.toDataURL('image/png');
    onRecognize(dataUrl, hint);
  };

  // Apply preprocessing live on canvas
  const handleRunPreprocessing = (action: keyof PreprocessingOptions) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updatedOptions = { ...preprocOptions, [action]: !preprocOptions[action] };
    setPreprocOptions(updatedOptions);

    applyPreprocessing(ctx, canvas.width, canvas.height, updatedOptions);
    saveState();
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col gap-4">
      
      {/* Benchmark Samples Selector Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Curated Low-Resource Kannada Handwriting Benchmarks
          </label>
          <span className="text-[11px] text-slate-400">Click to test instant script</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {BENCHMARK_SAMPLES.map((sample) => {
            const isSelected = selectedSample === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleLoadSample(sample)}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-750 hover:border-slate-600 text-slate-200'
                }`}
              >
                <div className="font-serif text-lg font-bold text-white mb-0.5 truncate">
                  {sample.kannadaText}
                </div>
                <div className="text-[11px] font-medium text-slate-400 truncate">
                  {sample.transliteration}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded font-mono ${
                    sample.difficulty === 'Extreme Low-Resource'
                      ? 'bg-rose-500/20 text-rose-300'
                      : sample.difficulty === 'Challenging'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {sample.difficulty}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Toolbars */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
        
        {/* Drawing Controls: Pen Width, Colors, Eraser */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Pen or Eraser */}
          <div className="inline-flex p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setIsEraser(false)}
              className={`p-1.5 rounded-md ${
                !isEraser ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Pen mode"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsEraser(true)}
              className={`p-1.5 rounded-md ${
                isEraser ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Eraser mode"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          {/* Pen Size Presets */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-[11px] text-slate-400">Size:</span>
            {[3, 6, 9, 12].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPenWidth(size)}
                className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[11px] ${
                  penWidth === size ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Paper Texture */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-[11px] text-slate-400">Style:</span>
            <button
              type="button"
              onClick={() => setPaperStyle('ruled')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                paperStyle === 'ruled' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ruled Guide
            </button>
            <button
              type="button"
              onClick={() => setPaperStyle('white')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                paperStyle === 'white' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Plain White
            </button>
            <button
              type="button"
              onClick={() => setPaperStyle('slate')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                paperStyle === 'slate' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Slate
            </button>
            <button
              type="button"
              onClick={() => setPaperStyle('palm')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                paperStyle === 'palm' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Palm Leaf
            </button>
          </div>

          {/* History Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 border border-slate-700 text-slate-300"
              title="Undo stroke"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 border border-slate-700 text-slate-300"
              title="Redo stroke"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clear & Preproc Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreproc(!showPreproc)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showPreproc
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Pre-OCR Filters</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

      </div>

      {/* Preprocessing Filters Sub-panel */}
      {showPreproc && (
        <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-900/40 text-xs flex flex-wrap items-center gap-3">
          <span className="font-semibold text-indigo-300 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" /> Morphological Enhancement:
          </span>
          <button
            type="button"
            onClick={() => handleRunPreprocessing('binarize')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Otsu Binarization
          </button>
          <button
            type="button"
            onClick={() => handleRunPreprocessing('enhanceContrast')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Contrast Stretch
          </button>
          <button
            type="button"
            onClick={() => handleRunPreprocessing('denoise')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Median Denoise
          </button>
          <button
            type="button"
            onClick={() => handleRunPreprocessing('skeletonize')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Zhang-Suen Thinning
          </button>
          <button
            type="button"
            onClick={() => handleRunPreprocessing('invert')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            Invert Polarity
          </button>
        </div>
      )}

      {/* Canvas Area */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-slate-950 flex justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full max-w-[800px] h-[260px] sm:h-[320px] touch-none cursor-crosshair select-none"
        />

        {/* Guideline Hints Watermark */}
        {paperStyle === 'ruled' && (
          <div className="absolute left-3 top-2 pointer-events-none text-[10px] text-slate-400/80 font-mono flex flex-col gap-8">
            <span className="text-amber-400/70">↑ Talakattu Zone (Top Hook)</span>
            <span className="text-slate-400/70">― Base Consonant Baseline</span>
            <span className="text-indigo-400/70">↓ Subscript Ottakshara Zone</span>
          </div>
        )}
      </div>

      {/* Recognition Trigger Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>Write single letters, conjunct aksharas, or entire Kannada words with your finger or stylus.</span>
        </div>

        <button
          type="button"
          onClick={triggerRecognition}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Attention Features...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Run Attention-Guided Recognition</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
