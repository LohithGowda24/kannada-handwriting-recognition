import { PreprocessingOptions } from '../types/htr';

// Convert canvas or imageData using image processing filters
export function applyPreprocessing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PreprocessingOptions
): ImageData {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Grayscale
  if (options.grayscale || options.binarize) {
    for (let i = 0; i < data.length; i += 4) {
      // Rec. 709 luminance weights: 0.2126 R + 0.7152 G + 0.0722 B
      const gray = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  // 2. Contrast Enhancement (Min-Max Stretch)
  if (options.enhanceContrast) {
    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const v = data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = max - min || 1;
    for (let i = 0; i < data.length; i += 4) {
      const stretched = Math.round(((data[i] - min) / range) * 255);
      data[i] = stretched;
      data[i + 1] = stretched;
      data[i + 2] = stretched;
    }
  }

  // 3. Denoise (3x3 median filter)
  if (options.denoise) {
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const neighbors: number[] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push(copy[idx]);
          }
        }
        neighbors.sort((a, b) => a - b);
        const median = neighbors[4];
        const targetIdx = (y * width + x) * 4;
        data[targetIdx] = median;
        data[targetIdx + 1] = median;
        data[targetIdx + 2] = median;
      }
    }
  }

  // 4. Binarization (Otsu's global thresholding or custom threshold)
  if (options.binarize) {
    let threshold = options.threshold;
    if (threshold === 0 || threshold === 128) {
      // Compute Otsu's threshold
      threshold = computeOtsuThreshold(data);
    }

    for (let i = 0; i < data.length; i += 4) {
      const v = data[i] < threshold ? 0 : 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
  }

  // 5. Inversion
  if (options.invert) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
  }

  // 6. Zhang-Suen Thinning (Skeletonization)
  if (options.skeletonize) {
    skeletonizeImage(data, width, height);
  }

  ctx.putImageData(imgData, 0, 0);
  return imgData;
}

// Compute Otsu's optimal threshold for binarization
export function computeOtsuThreshold(data: Uint8ClampedArray): number {
  const histogram = new Array(256).fill(0);
  let totalPixels = 0;

  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
    totalPixels++;
  }

  let sum = 0;
  for (let t = 0; t < 256; t++) {
    sum += t * histogram[t];
  }

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varianceBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varianceBetween > maxVariance) {
      maxVariance = varianceBetween;
      threshold = t;
    }
  }

  return threshold;
}

// Zhang-Suen thinning algorithm for stroke extraction
function skeletonizeImage(data: Uint8ClampedArray, width: number, height: number): void {
  // Convert to binary 0/1 array (1 = foreground black stroke, 0 = background white)
  const binary: number[][] = [];
  for (let y = 0; y < height; y++) {
    binary[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      binary[y][x] = data[idx] < 128 ? 1 : 0;
    }
  }

  let hasChanged = true;
  let iter = 0;

  while (hasChanged && iter < 10) {
    hasChanged = false;
    iter++;

    // Step 1
    const toDelete1: [number, number][] = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (binary[y][x] === 1) {
          const p2 = binary[y - 1][x];
          const p3 = binary[y - 1][x + 1];
          const p4 = binary[y][x + 1];
          const p5 = binary[y + 1][x + 1];
          const p6 = binary[y + 1][x];
          const p7 = binary[y + 1][x - 1];
          const p8 = binary[y][x - 1];
          const p9 = binary[y - 1][x - 1];

          const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          const a = (p2 === 0 && p3 === 1 ? 1 : 0) +
                    (p3 === 0 && p4 === 1 ? 1 : 0) +
                    (p4 === 0 && p5 === 1 ? 1 : 0) +
                    (p5 === 0 && p6 === 1 ? 1 : 0) +
                    (p6 === 0 && p7 === 1 ? 1 : 0) +
                    (p7 === 0 && p8 === 1 ? 1 : 0) +
                    (p8 === 0 && p9 === 1 ? 1 : 0) +
                    (p9 === 0 && p2 === 1 ? 1 : 0);

          if (b >= 2 && b <= 6 && a === 1 && (p2 * p4 * p6 === 0) && (p4 * p6 * p8 === 0)) {
            toDelete1.push([y, x]);
          }
        }
      }
    }

    for (const [y, x] of toDelete1) {
      binary[y][x] = 0;
      hasChanged = true;
    }

    // Step 2
    const toDelete2: [number, number][] = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (binary[y][x] === 1) {
          const p2 = binary[y - 1][x];
          const p3 = binary[y - 1][x + 1];
          const p4 = binary[y][x + 1];
          const p5 = binary[y + 1][x + 1];
          const p6 = binary[y + 1][x];
          const p7 = binary[y + 1][x - 1];
          const p8 = binary[y][x - 1];
          const p9 = binary[y - 1][x - 1];

          const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          const a = (p2 === 0 && p3 === 1 ? 1 : 0) +
                    (p3 === 0 && p4 === 1 ? 1 : 0) +
                    (p4 === 0 && p5 === 1 ? 1 : 0) +
                    (p5 === 0 && p6 === 1 ? 1 : 0) +
                    (p6 === 0 && p7 === 1 ? 1 : 0) +
                    (p7 === 0 && p8 === 1 ? 1 : 0) +
                    (p8 === 0 && p9 === 1 ? 1 : 0) +
                    (p9 === 0 && p2 === 1 ? 1 : 0);

          if (b >= 2 && b <= 6 && a === 1 && (p2 * p4 * p8 === 0) && (p2 * p6 * p8 === 0)) {
            toDelete2.push([y, x]);
          }
        }
      }
    }

    for (const [y, x] of toDelete2) {
      binary[y][x] = 0;
      hasChanged = true;
    }
  }

  // Write back to image data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const v = binary[y][x] === 1 ? 0 : 255;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
    }
  }
}
