export interface CharBreakdown {
  akshara: string;
  unicodeHex: string;
  components: string[];
  confidence: number;
  attentionFocus?: string;
  strokeType?: 'vowel' | 'consonant' | 'matra' | 'ottakshara' | 'numeral' | 'special';
}

export interface Segment {
  text: string;
  transliteration: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  charBreakdown?: CharBreakdown[];
}

export interface RecognitionResult {
  recognizedText: string;
  transliteration: string;
  translation?: string;
  confidence: number;
  style: string;
  readabilityScore: number;
  segments: Segment[];
  attentionInsights: string[];
  linguisticNotes?: string;
}

export interface KannadaSample {
  id: string;
  title: string;
  category: 'minimal_pairs' | 'complex_ottakshara' | 'cursive_messy' | 'degraded_ink' | 'kagunitha' | 'numerals';
  kannadaText: string;
  transliteration: string;
  meaning: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging' | 'Extreme Low-Resource';
  description: string;
  handwritingStyle: string;
  // SVG stroke paths or canvas instructions
  strokes: Array<{
    points: Array<[number, number]>;
    width?: number;
    color?: string;
  }>;
}

export interface PreprocessingOptions {
  grayscale: boolean;
  binarize: boolean;
  threshold: number; // 0 - 255
  invert: boolean;
  enhanceContrast: boolean;
  denoise: boolean;
  skeletonize: boolean;
}

export interface AttentionLayerState {
  step: number;
  currentChar: string;
  spatialHeatmap: number[][]; // normalized 0..1 matrix
  temporalWeights: number[];
  boundingFocus: [number, number, number, number];
}
