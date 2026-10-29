import { KannadaSample } from '../types/htr';

export const BENCHMARK_SAMPLES: KannadaSample[] = [
  {
    id: 'kannada-word',
    title: 'ಕನ್ನಡ (Kannada)',
    category: 'complex_ottakshara',
    kannadaText: 'ಕನ್ನಡ',
    transliteration: 'Kannaḍa',
    meaning: 'The Kannada language & heritage',
    difficulty: 'Medium',
    handwritingStyle: 'Curved Cursive Pen Ink',
    description: 'Features the geminate conjunct consonant "ನ್ನ" (Na + virama + Na ottakshara) and retroflex "ಡ". Crucial test for vertical ligature detection.',
    strokes: [
      // Ka
      {
        points: [[70, 95], [85, 95], [115, 95], [105, 115], [90, 140], [75, 175], [95, 205], [130, 205], [145, 180], [130, 150], [90, 140]],
        width: 5,
      },
      // Ka cross stroke
      {
        points: [[100, 110], [120, 170]],
        width: 4,
      },
      // Nna (base na)
      {
        points: [[175, 110], [195, 100], [215, 120], [200, 145], [180, 150], [210, 160], [235, 150], [245, 125], [235, 105], [215, 105]],
        width: 5,
      },
      // Talakattu over Na
      {
        points: [[195, 92], [225, 90]],
        width: 4,
      },
      // Na-ottakshara subscript below
      {
        points: [[210, 175], [225, 195], [245, 190], [240, 175], [260, 185]],
        width: 4,
      },
      // Da
      {
        points: [[290, 110], [315, 95], [345, 105], [335, 135], [305, 145], [330, 175], [355, 160], [360, 130]],
        width: 5,
      },
      // Da top tick
      {
        points: [[310, 92], [340, 90]],
        width: 4,
      },
    ],
  },
  {
    id: 'namaskara',
    title: 'ನಮಸ್ಕಾರ (Namaskāra)',
    category: 'complex_ottakshara',
    kannadaText: 'ನಮಸ್ಕಾರ',
    transliteration: 'Namaskāra',
    meaning: 'Traditional Indian Greeting / Salutations',
    difficulty: 'Challenging',
    handwritingStyle: 'Rapid Handwriting (Messy Cursive)',
    description: 'Challenging conjunct "ಸ್ಕಾ" (Sa + Virama + Ka + Aa-kara matra). Tests both horizontal and vertical spatial attention gates.',
    strokes: [
      // Na
      {
        points: [[60, 120], [75, 105], [95, 115], [85, 140], [70, 145], [95, 155], [115, 145], [125, 125], [115, 105], [95, 105]],
        width: 5,
      },
      // Ma
      {
        points: [[145, 135], [160, 115], [180, 120], [185, 145], [165, 155], [150, 145], [150, 115], [185, 115], [195, 135], [190, 155]],
        width: 5,
      },
      // Sa
      {
        points: [[220, 135], [235, 115], [255, 115], [265, 135], [255, 155], [230, 155], [260, 120], [280, 120], [285, 155]],
        width: 5,
      },
      // Ka ottakshara subscript
      {
        points: [[260, 170], [275, 170], [285, 185], [270, 195], [260, 185], [290, 185]],
        width: 4,
      },
      // Dīrgha matra 'ಾ'
      {
        points: [[295, 115], [310, 115], [305, 155]],
        width: 5,
      },
      // Ra
      {
        points: [[335, 135], [350, 115], [370, 125], [375, 145], [360, 160], [340, 150], [340, 130]],
        width: 5,
      },
    ],
  },
  {
    id: 'ba-vs-bha',
    title: 'ಬ vs ಭ (Ba vs Bha Minimal Pair)',
    category: 'minimal_pairs',
    kannadaText: 'ಬೆಳಕು - ಭಾರತ',
    transliteration: 'Beḷaku - Bhārata',
    meaning: 'Light - India (Minimal Pair Ambiguity Test)',
    difficulty: 'Extreme Low-Resource',
    handwritingStyle: 'Faint Ink with Low Contrast',
    description: 'Classic Dravidian OCR confusion: unaspirated Ba vs aspirated Bha. Bha has a bottom cleft/stroke that is easily eroded in degraded text.',
    strokes: [
      // Ba
      {
        points: [[60, 135], [75, 110], [105, 115], [115, 140], [105, 160], [75, 160], [65, 145]],
        width: 4.5,
      },
      // Ba top tick
      {
        points: [[75, 105], [105, 105]],
        width: 4,
      },
      // Separator dash
      {
        points: [[140, 135], [165, 135]],
        width: 3.5,
      },
      // Bha (Notice bottom-center notch stroke)
      {
        points: [[195, 135], [210, 110], [240, 115], [250, 140], [240, 160], [225, 160], [225, 180], [225, 160], [210, 160], [200, 145]],
        width: 4.5,
      },
      // Bha notch detail
      {
        points: [[225, 155], [225, 185]],
        width: 5,
      },
      // Bha top tick
      {
        points: [[210, 105], [240, 105]],
        width: 4,
      },
    ],
  },
  {
    id: 'swatantrya',
    title: 'ಸ್ವಾತಂತ್ರ್ಯ (Freedom / Independence)',
    category: 'complex_ottakshara',
    kannadaText: 'ಸ್ವಾತಂತ್ರ್ಯ',
    transliteration: 'Svātantrya',
    meaning: 'Freedom / Independence',
    difficulty: 'Extreme Low-Resource',
    handwritingStyle: 'Historical Inscription / Freehand',
    description: 'High-density compound akshara with multi-level subscripts: Va-ottakshara, Anusvara, and combined Ta+Ra+Ya conjunct.',
    strokes: [
      // Sa
      {
        points: [[50, 130], [65, 110], [90, 110], [100, 130], [90, 150], [65, 150], [95, 115], [115, 115], [120, 150]],
        width: 4.5,
      },
      // Va-ottakshara below Sa
      {
        points: [[75, 165], [90, 165], [95, 185], [80, 190], [70, 180], [75, 165]],
        width: 4,
      },
      // Dirgha matra
      {
        points: [[130, 110], [145, 110], [140, 150]],
        width: 4.5,
      },
      // Ta
      {
        points: [[165, 130], [180, 110], [205, 115], [210, 140], [195, 155], [175, 145]],
        width: 4.5,
      },
      // Anusvara circle
      {
        points: [[230, 135], [240, 125], [250, 135], [240, 145], [230, 135]],
        width: 4.5,
      },
      // Tra + ya conjunct
      {
        points: [[270, 130], [285, 110], [310, 115], [315, 140], [300, 155], [280, 145]],
        width: 4.5,
      },
      // Ya subscript stroke sweep
      {
        points: [[285, 165], [310, 165], [325, 180], [310, 200], [285, 195], [335, 195]],
        width: 4,
      },
    ],
  },
  {
    id: 'kannada-numerals',
    title: '೧ ೨ ೩ ೪ ೫ ೬ ೭ ೮ ೯ ೦ (Kannada Digits)',
    category: 'numerals',
    kannadaText: '೧೨೩೪೫೬೭೮೯೦',
    transliteration: '1 2 3 4 5 6 7 8 9 0',
    meaning: 'Kannada Decimal Numerals',
    difficulty: 'Easy',
    handwritingStyle: 'Classroom Slate Pen',
    description: 'Low-resource digit recognition. Essential for handwritten land records, postal PIN codes, and accounting ledgers across Karnataka.',
    strokes: [
      // 1 (Ondu)
      { points: [[50, 150], [60, 120], [75, 130], [70, 160], [85, 160]], width: 4.5 },
      // 2 (Eradu)
      { points: [[110, 125], [125, 115], [140, 125], [135, 145], [115, 160], [145, 160]], width: 4.5 },
      // 3 (Muru)
      { points: [[175, 125], [195, 115], [205, 135], [190, 140], [205, 150], [185, 165]], width: 4.5 },
      // 4 (Nalku)
      { points: [[235, 125], [250, 115], [265, 125], [255, 165], [240, 145], [270, 145]], width: 4.5 },
      // 5 (Aidu)
      { points: [[300, 125], [315, 115], [330, 130], [325, 150], [310, 165], [335, 165]], width: 4.5 },
    ],
  },
  {
    id: 'bengaluru',
    title: 'ಬೆಂಗಳೂರು (Bengaluru)',
    category: 'cursive_messy',
    kannadaText: 'ಬೆಂಗಳೂರು',
    transliteration: 'Beṅgaḷūru',
    meaning: 'Bengaluru (Capital city of Karnataka)',
    difficulty: 'Medium',
    handwritingStyle: 'Rapid Street Signboard / Note',
    description: 'Contains Anusvara "ಂ", velar Ga "ಗ", and retroflex La with Dirgha U-kara matra "ಳೂ".',
    strokes: [
      // Ba
      { points: [[60, 135], [75, 110], [105, 115], [115, 140], [105, 160], [75, 160], [65, 145]], width: 4.5 },
      { points: [[75, 105], [105, 105]], width: 4 },
      // Anusvara
      { points: [[130, 135], [140, 125], [150, 135], [140, 145], [130, 135]], width: 4.5 },
      // Ga
      { points: [[175, 140], [190, 115], [215, 120], [225, 145], [205, 160], [185, 155]], width: 4.5 },
      { points: [[190, 105], [215, 105]], width: 4 },
      // Loo
      { points: [[250, 135], [265, 115], [285, 120], [295, 140], [280, 160], [260, 155], [290, 155], [305, 140], [310, 165]], width: 4.5 },
      // Ru
      { points: [[335, 135], [350, 115], [370, 125], [375, 145], [360, 160], [340, 150], [375, 165]], width: 4.5 },
    ],
  },
];
