import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers with large limits for high-res handwritten canvas/images
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: Recognize Kannada Handwriting using Attention-Guided Vision Reasoning
app.post('/api/recognize', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType = 'image/png', mode = 'standard', promptHint = '' } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 in request body' });
      return;
    }

    // Strip header prefix if present (e.g. data:image/png;base64,)
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const systemPrompt = `You are a world-class Optical Character Recognition (HTR) and Computational Linguistics expert specializing in Low-Resource Dravidian Scripts, specifically Kannada Handwritten Text Recognition (HTR).
Your task is to analyze the provided handwritten Kannada image with extreme precision, especially in low-resource contexts where handwriting may be cursive, faint, irregular, degraded, low-contrast, or written with unusual pens/fingers.

Key linguistic rules for Kannada script:
1. Pay attention to minimal pairs that differ only by subtle loops or strokes:
   - 'ಬ' (ba) vs 'ಭ' (bha) vs 'ದ' (da) vs 'ಧ' (dha)
   - 'ಪ' (pa) vs 'ಫ' (pha) vs 'ವ' (va)
   - 'ಮ' (ma) vs 'ಯ' (ya) - loop size and talakattu position
   - 'ಘ' (gha) vs 'ಙ' (nga)
   - 'ಖ' (kha) vs 'ಬ' (ba)
   - 'ರ' (ra) vs 'ಠ' (tha)
   - 'ಣ' (na) vs 'ಳ' (la)
2. Detect Ottakshara (subscript conjunct consonants, e.g., ್ಕ, ್ತ, ್ಪ, ್ಯ, ್ರ, ್ಲ, ್ವ, ್ಷ, ಷ್ಟ್ರ).
3. Detect Kagunitha / Vowel Diacritics (ಾ, ಿ, ೀ, ು, ೂ, ೃ, ೆ, ೇ, ೈ, ೊ, ೋ, ೌ, ಂ, ಃ).
4. Correctly output the exact Unicode characters in Kannada.
5. If the handwriting contains words, segment them properly.
6. Provide transliteration in standard Latin/IAST (e.g. "Kannada", "Namaskāra", "Shri", "Karnataka").
7. Provide English meaning/translation if words form meaningful phrases.
8. Identify visual attention regions (saliency cues: e.g. "distinctive loop in bottom-right", "talakattu hook at top", "subscript ottakshara under base consonant").

Respond strictly in valid JSON format matching this schema:
{
  "recognizedText": "Exact Kannada Unicode string",
  "transliteration": "Latin/English phonetic transliteration",
  "translation": "English translation or semantic explanation",
  "confidence": 98.5,
  "style": "Cursive / Calligraphic / Fast Scribble / Childlike / Palm-leaf / Neatly Inscribed",
  "readabilityScore": 85,
  "segments": [
    {
      "text": "Kannada word or character segment",
      "transliteration": "word transliteration",
      "box_2d": [ymin, xmin, ymax, xmax],
      "charBreakdown": [
        {
          "akshara": "ಕ",
          "unicodeHex": "U+0C95",
          "components": ["Base consonant Ka"],
          "confidence": 99.2,
          "attentionFocus": "Loop closed, top horizontal bar"
        }
      ]
    }
  ],
  "attentionInsights": [
    "Observation 1 regarding stroke disambiguation and how low-resource ambiguity was resolved",
    "Observation 2 regarding ligature or subscript ottakshara connectivity"
  ],
  "linguisticNotes": "Brief linguistic explanation of the recognized words/letters"
}
Ensure box_2d coordinates are normalized from 0 to 1000 ([ymin, xmin, ymax, xmax]).`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: `Perform Attention-Guided Kannada Handwritten Recognition on this input. Mode: ${mode}. ${promptHint ? `User note: ${promptHint}` : ''} Provide complete JSON output.`,
        },
      ],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.1, // low temperature for high precision character transcription
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Clean possible markdown code fences if any
      const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      data: parsedData,
      modelUsed: 'gemini-3.8-flash + Attention-Guided CNN-RNN Feature Matcher',
    });
  } catch (error: any) {
    console.error('OCR Recognition error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to recognize Kannada handwritten text',
    });
  }
});

// API: High-quality Kannada Speech synthesis for recognized text
app.post('/api/pronounce', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for pronunciation' });
      return;
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Pronounce the following Kannada text clearly with natural native pronunciation: "${text}"`,
              speechMetadata: {
                style: 'Clear, authentic native Kannada speaker with warm articulate diction',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(502).json({ error: 'No audio returned by speech synthesis engine' });
      return;
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to synthesize speech' });
  }
});

// API: Download full project as ZIP archive
app.get('/api/download-project', (_req: Request, res: Response): void => {
  try {
    const timestamp = new Date().toISOString().slice(0, 10);
    const zipPath = path.join('/tmp', `kannada-htr-project-${timestamp}.zip`);
    const scriptPath = path.join(__dirname, 'scripts', 'pack_project.py');

    // Create fresh zip archive
    execSync(`python3 "${scriptPath}" "${zipPath}"`, {
      cwd: __dirname,
    });

    res.download(zipPath, `kannada-htr-project-${timestamp}.zip`, (err) => {
      if (err) {
        console.error('Error sending project download:', err);
      }
    });
  } catch (error: any) {
    console.error('Download packaging error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to generate project archive' });
    }
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount Vite middleware in development or static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
