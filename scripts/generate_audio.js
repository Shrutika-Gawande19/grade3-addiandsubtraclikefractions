import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env.local
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        if (key && value) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (err) {
  console.log('Notice: .env.local file not found or could not be read.');
}

const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.warn("WARNING: VITE_ELEVENLABS_API_KEY is not set. Generating map only, audio files will not be downloaded.");
}

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
const MODEL = 'eleven_multilingual_v2';

const VOICE_SETTINGS = {
  celebration: { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement: { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question: { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis: { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking: { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement: { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction: { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
};

const phrases = [
  // Intro
  { text: "Welcome to Numberville! The annual Fraction Festival is about to begin, and your friends need your help. Are you ready to become a Fraction Hero? Let's get started!", style: 'statement' },
  
  // Wonder
  { text: "Let's wonder about this! John baked a delicious pizza cut into eight equal slices. He ate two eighths in the morning, and then three eighths in the afternoon. When we combine them, we get five slices. But wait... are they still eighths, or did the pizza suddenly get sliced into sixteenths? Let's check out the story to see how it works!", style: 'statement' },
  
  // Story
  { text: "John baked a pizza cut into 8 equal slices. He ate two eighths in the morning and three eighths in the afternoon. We add the top numbers: two plus three equals five. So John ate five eighths of the pizza! The denominator stays eight because the slices are the same size.", style: 'statement' },
  { text: "The addition rule for like fractions is simple. Keep the denominator the same, and add only the numerators. Two eighths plus three eighths equals five eighths. The pizza still has eight slices!", style: 'statement' },
  { text: "Sarah has five sixths of a ribbon. She cuts away two sixths to wrap a gift box. We subtract the numerators: five minus two equals three. Sarah has three sixths of ribbon left! The denominator stays six.", style: 'statement' },
  { text: "The subtraction rule for like fractions works the same way as addition. Keep the denominator, subtract the numerators. Five sixths minus two sixths equals three sixths!", style: 'statement' },
  { text: "Mike needs help with two equations. Three fifths plus one fifth equals four fifths. And four fifths minus two fifths equals two fifths. Whether adding or subtracting like fractions, the denominator always stays the same!", style: 'statement' },
  { text: "Congratulations! You have learned the golden rule of like fractions. Whether adding or subtracting, the denominator stays the same. Only the numerators change. You are now a Fraction Hero! Let's go to the simulator to practice!", style: 'statement' },
  
  // Simulate
  { text: "First, select 2 slices (2/8) for John's breakfast. Click or tap 2 empty slices to color them orange.", style: 'instruction' },
  { text: "Nice! Now select 3 more slices (3/8) for John's afternoon snack. Click 3 empty slices to color them purple.", style: 'instruction' },
  { text: "Great work! 2 eighths plus 3 eighths is 5 eighths. You can see 5 shaded slices. The total slices in the pizza stays 8!", style: 'celebration' },
  { text: "We start with 5 sixths (5/6) of the ribbon colored in blue. Click on 2 segments to 'snip' them away.", style: 'instruction' },
  { text: "Fabulous! You cut away 2 sixths. 5 sixths minus 2 sixths is 3 sixths. Look, 3 blue segments are left!", style: 'celebration' },
  { text: "Mike's Pie Mix-up: Help Mike solve the equation card!", style: 'instruction' },
  { text: "First, click the plus (+) button to select addition.", style: 'instruction' },
  { text: "Now drag the slider to 4 slices to represent the total 4/5 pie.", style: 'instruction' },
  { text: "Excellent! 3 fifths plus 1 fifth equals 4 fifths. Mike's pie is perfectly sorted!", style: 'celebration' },
  
  // Celebration
  { text: "Congratulations! You did it! The Fraction Festival is saved and you are now an official Fraction Hero of Numberville. John, Sarah, Mike, and Priya are so proud of you! See you on the next adventure!", style: 'celebration' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const slugify = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '').substring(0, 50);
};

async function generateAudio() {
  const outputDir = path.join(__dirname, '../public/assets/audio');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const audioMap = {};
  
  for (let i = 0; i < phrases.length; i++) {
    const item = phrases[i];
    const slug = slugify(item.text);
    // ensure unique filename if collisions exist
    const filename = `audio_${slug}_${i}.mp3`;
    const filepath = path.join(outputDir, filename);
    const publicPath = `/assets/audio/${filename}`;
    
    audioMap[item.text] = publicPath;

    if (fs.existsSync(filepath)) {
      console.log(`[${i+1}/${phrases.length}] Skipping existing: ${filename}`);
      continue;
    }

    if (!API_KEY) {
      console.log(`[${i+1}/${phrases.length}] Skipping API call (no key): ${filename}`);
      continue;
    }

    console.log(`[${i+1}/${phrases.length}] Generating: ${filename}`);
    
    const settings = VOICE_SETTINGS[item.style] || VOICE_SETTINGS['statement'];
    
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: item.text,
          model_id: MODEL,
          voice_settings: settings
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filepath, Buffer.from(buffer));
      console.log(`   Saved to ${publicPath}`);
      
      // Rate limiting: wait 500ms between calls
      await sleep(500);
    } catch (err) {
      console.error(`   Error generating ${filename}: `, err.message);
    }
  }

  // Generate src/utils/audioMap.js
  const mapPath = path.join(__dirname, '../src/utils/audioMap.js');
  const mapContent = `// Auto-generated by scripts/generate_audio.js\nexport const audioMap = ${JSON.stringify(audioMap, null, 2)};\n`;
  fs.writeFileSync(mapPath, mapContent);
  console.log(`\nGenerated audioMap.js at src/utils/audioMap.js`);
}

generateAudio();
