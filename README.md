# Attention-Guided CNN–RNN Architecture for Low-Resource Kannada Handwritten Text Recognition (HTR)

A state-of-the-art Optical Character Recognition & Sequence Modeling system designed specifically for low-resource Dravidian scripts, focusing on handwritten Kannada text with high accuracy across diverse and degraded handwriting styles.

---

## 🌟 Key Features

1. **2D Spatial Attention Gate**:
   - Isolates crucial fine-grained Kannada stroke features (e.g., top *talakattu* hooks, loops, and bottom subscript *ottakshara* ligatures).
   - Suppresses background paper noise, bleed-through ink, and uneven handwriting pressure.

2. **Bidirectional RNN Sequence Modeling (Bi-LSTM)**:
   - Encodes horizontal feature vectors ($H_t \in \mathbb{R}^{2D}$) capturing forward and backward contextual transitions across cursive Kannada syllables.

3. **Additive Bahdanau Cross-Attention Decoder**:
   - Dynamically shifts attention across temporal and spatial frames for each decoded Kannada character.
   - Live interactive attention heatmap visualization overlaid on the user's handwritten strokes.

4. **Minimal Pair Disambiguation**:
   - Resolves classic Dravidian optical ambiguities:
     - **'ಬ' (Ba)** vs. **'ಭ' (Bha)**: Identifies bottom center notch/cleft.
     - **'ಮ' (Ma)** vs. **'ಯ' (Ya)**: Analyzes loop radius and talakattu horizontal offset.
     - **'ಪ' (Pa)** vs. **'ಫ' (Pha)**: Detects interior aspiration slash.
     - **'ದ' (Da)** vs. **'ಧ' (Dha)**: Detects vertical descender.

5. **Compound Akshara & Ottakshara Decomposition**:
   - Accurately segments Base Consonants, Vowel Matras (Kagunitha), Subscript Ottaksharas, and Unicode code points (`U+0C80` - `U+0CFF`).

6. **Native Audio Pronunciation**:
   - Integrated with Gemini 3.8 Flash Lite TTS to speak recognized Kannada phrases with native pronunciation.

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/).

### 2. Installation
Extract the downloaded zip archive and navigate into the project directory:
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and set your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── server.ts                  # Express backend with Gemini 3.8 Flash Vision OCR & TTS routes
├── index.html                 # HTML entry point with metadata
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build and Tailwind CSS configuration
├── src/
│   ├── main.tsx               # React root entry point
│   ├── App.tsx                # Main application coordinator
│   ├── index.css              # Global Tailwind CSS imports
│   ├── types/
│   │   └── htr.ts             # TypeScript definitions for HTR & Attention
│   ├── data/
│   │   └── kannadaSamples.ts  # Benchmark handwriting samples (minimal pairs, cursive, etc.)
│   ├── utils/
│   │   ├── attentionSimulation.ts # Spatial attention gating and Bahdanau weights
│   │   ├── imageProcessing.ts     # Otsu binarization, Zhang-Suen thinning, contrast
│   │   └── kannadaLinguistics.ts  # Akshara decomposer, Unicode tables, minimal pairs
│   └── components/
│       ├── Header.tsx             # Navigation, mode toggle, and project download
│       ├── DrawingCanvas.tsx      # Interactive stylus/canvas with ruled Kannada guidelines
│       ├── ImageUploadCrop.tsx    # Upload & live camera snapshot with pre-OCR filters
│       ├── AttentionViewer.tsx    # Interactive attention heatmaps & focus spotlights
│       ├── RecognitionResults.tsx # Formatted Kannada text, transliteration & audio
│       ├── ArchitectureModal.tsx  # Deep-dive into neural layers & math equations
│       ├── BenchmarkSuite.tsx     # CER, WER, and model comparison metrics
│       └── KagunithaReference.tsx # Kannada alphabet & Kagunitha matrix explorer
```

---

## 📄 License
Apache-2.0
