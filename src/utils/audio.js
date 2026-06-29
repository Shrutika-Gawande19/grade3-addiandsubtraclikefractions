// ──────────────────────────────────────────────────
// Audio & Speech Synthesis Engine - Like Fractions
// Web Speech API fallback + Web Audio API SFX
// ──────────────────────────────────────────────────

let isMuted = false;
let currentUtterance = null;
let audioCtx = null;

// Initialize Audio Context on demand (due to browser autoplay policies)
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Speech styles mapping to pitch and rate for natural teacher-like speech
const SPEECH_STYLES = {
  statement: { rate: 0.9, pitch: 1.15 },
  question: { rate: 0.85, pitch: 1.2 },
  encouragement: { rate: 0.95, pitch: 1.25 },
  emphasis: { rate: 0.8, pitch: 1.15 },
  thinking: { rate: 0.85, pitch: 1.0 },
  celebration: { rate: 1.05, pitch: 1.3 },
  instruction: { rate: 0.85, pitch: 1.1 },
};

// Narration Player
export function narrate(text, style = 'statement', onEndCallback = null) {
  if (isMuted) {
    if (onEndCallback) onEndCallback();
    return null;
  }

  stopNarration();

  const utterance = new SpeechSynthesisUtterance(text);
  const settings = SPEECH_STYLES[style] || SPEECH_STYLES.statement;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;

  // Try to find a friendly English voice (prefer female/child-like if available, else default English)
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                       voices.find(v => v.lang.startsWith('en')) || 
                       voices[0];
  
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.onend = () => {
    if (currentUtterance === utterance) {
      currentUtterance = null;
    }
    if (onEndCallback) onEndCallback();
  };

  utterance.onerror = () => {
    if (currentUtterance === utterance) {
      currentUtterance = null;
    }
    if (onEndCallback) onEndCallback();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => {
      if (currentUtterance === utterance) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
      }
    }
  };
}

export function stopNarration() {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

// ──────────────────────────────────────────────────
// SFX Synthesizers via Web Audio API
// ──────────────────────────────────────────────────

// Play click sound
export function playClickSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn('Click SFX failed:', e);
  }
}

// Play correct answer chime
export function playCorrectChime() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Notes of a nice C major chord arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  } catch (e) {
    console.warn('Correct SFX failed:', e);
  }
}

// Play wrong answer buzzer
export function playWrongBuzzer() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    
    // Low detuned frequencies for a buzzer effect
    osc1.frequency.setValueAtTime(130, now);
    osc2.frequency.setValueAtTime(133, now);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.41);
    osc2.stop(now + 0.41);
  } catch (e) {
    console.warn('Wrong SFX failed:', e);
  }
}

// Play badge award fanfare
export function playBadgeFanfare() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Celebration chords: C4 -> G4 -> C5 -> E5 -> G5
    const notes = [261.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });
  } catch (e) {
    console.warn('Badge SFX failed:', e);
  }
}

// Play bubble pop/confetti pop
export function playPopSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn('Pop SFX failed:', e);
  }
}

// Global Audio controller
export const audioController = {
  getMuted: () => isMuted,
  setMuted: (muted) => {
    isMuted = muted;
    if (isMuted) stopNarration();
  },
  playClick: playClickSound,
  playCorrect: playCorrectChime,
  playWrong: playWrongBuzzer,
  playBadge: playBadgeFanfare,
  playPop: playPopSound,
};
