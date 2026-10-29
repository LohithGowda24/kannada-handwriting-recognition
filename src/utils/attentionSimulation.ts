// 2D Spatial-Temporal Attention simulation for Attention-Guided CNN-RNN

export interface SpatialTemporalAttention {
  gridWidth: number;
  gridHeight: number;
  heatmaps: {
    char: string;
    charIndex: number;
    weights: number[][]; // [row][col] 0..1
    temporalCurve: number[]; // Bahdanau alignment across sequence length W'
    focusBox: { xmin: number; ymin: number; xmax: number; ymax: number };
  }[];
}

// Generate realistic spatial-temporal attention matrix for character tokens across the image width/height
export function generateAttentionMaps(
  characters: string[],
  canvasWidth: number,
  canvasHeight: number,
  gridCols = 32,
  gridRows = 16,
  boundingSegments?: { xmin: number; ymin: number; xmax: number; ymax: number }[]
): SpatialTemporalAttention {
  const numChars = Math.max(1, characters.length);
  const heatmaps = [];

  for (let i = 0; i < numChars; i++) {
    const char = characters[i] || '?';
    
    // Determine the spatial center for this character
    let centerX: number;
    let centerY: number;
    let spanX: number;
    let spanY: number;

    if (boundingSegments && boundingSegments[i]) {
      const seg = boundingSegments[i];
      centerX = ((seg.xmin + seg.xmax) / 2 / 1000) * gridCols;
      centerY = ((seg.ymin + seg.ymax) / 2 / 1000) * gridRows;
      spanX = Math.max(1.8, ((seg.xmax - seg.xmin) / 1000) * gridCols * 0.7);
      spanY = Math.max(1.8, ((seg.ymax - seg.ymin) / 1000) * gridRows * 0.7);
    } else {
      // Linear layout across time sequence with slight margin
      const margin = gridCols * 0.1;
      const effectiveWidth = gridCols - margin * 2;
      centerX = margin + ((i + 0.5) / numChars) * effectiveWidth;
      centerY = gridRows * 0.5;
      spanX = Math.max(1.8, (effectiveWidth / numChars) * 0.85);
      spanY = gridRows * 0.45;
    }

    // 2D Gaussian Kernel with spatial attention gating
    const weights: number[][] = [];
    for (let r = 0; r < gridRows; r++) {
      weights[r] = [];
      for (let c = 0; c < gridCols; c++) {
        const dx = (c - centerX) / (spanX * 0.75);
        const dy = (r - centerY) / (spanY * 0.75);
        const distSq = dx * dx + dy * dy;
        // Gaussian bell curve + subtle background diffuse activation
        const intensity = Math.exp(-0.5 * distSq);
        // Add subtle pseudo-convolutional edge activation
        const subtleNoise = (Math.sin(c * 1.5 + r * 1.2) * 0.05);
        weights[r][c] = Math.max(0, Math.min(1, intensity + Math.max(0, subtleNoise * intensity)));
      }
    }

    // Temporal Bahdanau attention vector (summing over height column)
    const temporalCurve: number[] = [];
    for (let c = 0; c < gridCols; c++) {
      let colSum = 0;
      for (let r = 0; r < gridRows; r++) {
        colSum += weights[r][c];
      }
      temporalCurve.push(colSum / gridRows);
    }

    // Normalize temporal vector with softmax-like scaling
    const maxT = Math.max(...temporalCurve, 0.001);
    for (let c = 0; c < gridCols; c++) {
      temporalCurve[c] = temporalCurve[c] / maxT;
    }

    heatmaps.push({
      char,
      charIndex: i,
      weights,
      temporalCurve,
      focusBox: {
        xmin: Math.max(0, (centerX - spanX) / gridCols),
        ymin: Math.max(0, (centerY - spanY) / gridRows),
        xmax: Math.min(1, (centerX + spanX) / gridCols),
        ymax: Math.min(1, (centerY + spanY) / gridRows),
      },
    });
  }

  return {
    gridWidth: gridCols,
    gridHeight: gridRows,
    heatmaps,
  };
}

// Draw the attention heatmap overlaid on the target context
export function renderAttentionHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  heatmap: number[][],
  opacity = 0.55,
  colorScheme: 'thermal' | 'amber' | 'emerald' = 'thermal'
): void {
  const rows = heatmap.length;
  const cols = heatmap[0].length;
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = cols;
  tempCanvas.height = rows;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  const imgData = tempCtx.createImageData(cols, rows);
  const data = imgData.data;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = Math.max(0, Math.min(1, heatmap[r][c]));
      const idx = (r * cols + c) * 4;

      if (val < 0.08) {
        // Below noise threshold, transparent
        data[idx + 3] = 0;
        continue;
      }

      // Colormap function
      let rVal = 0, gVal = 0, bVal = 0;
      if (colorScheme === 'thermal') {
        // Jet/Turbo style: Purple -> Cyan -> Yellow -> Bright Red
        if (val < 0.25) {
          const t = val / 0.25;
          rVal = 75 * (1 - t);
          gVal = 0;
          bVal = 130 + 125 * t;
        } else if (val < 0.5) {
          const t = (val - 0.25) / 0.25;
          rVal = 0;
          gVal = 200 * t;
          bVal = 255;
        } else if (val < 0.75) {
          const t = (val - 0.5) / 0.25;
          rVal = 255 * t;
          gVal = 220 + 35 * (1 - t);
          bVal = 255 * (1 - t);
        } else {
          const t = (val - 0.75) / 0.25;
          rVal = 255;
          gVal = 255 * (1 - t * 0.7);
          bVal = 0;
        }
      } else if (colorScheme === 'amber') {
        rVal = 245;
        gVal = Math.round(158 * val);
        bVal = 11;
      } else {
        rVal = 16;
        gVal = 185;
        bVal = Math.round(129 * val);
      }

      data[idx] = rVal;
      data[idx + 1] = gVal;
      data[idx + 2] = bVal;
      data[idx + 3] = Math.round(val * 240);
    }
  }

  tempCtx.putImageData(imgData, 0, 0);

  // Smooth-upscale the low-res feature attention grid onto high-res canvas
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tempCanvas, 0, 0, width, height);
  ctx.restore();
}
