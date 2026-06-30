import { useEffect, useRef, useState } from 'react';
import { narrate, stopNarration, audioController } from '../utils/audio';
import { NARRATION } from '../utils/narration';

const JOURNEY = [
  { icon: '🔍', label: 'Wonder',   desc: 'Explore the puzzle',   color: '#a78bfa' },
  { icon: '📖', label: 'Story',    desc: 'Meet the characters',  color: '#fbbf24' },
  { icon: '🧪', label: 'Simulate', desc: 'Visual fractions',     color: '#34d399' },
  { icon: '🎮', label: 'Play',     desc: 'Practice challenges',  color: '#60a5fa' },
  { icon: '🏆', label: 'Reflect',  desc: 'Earn your badge!',     color: '#f87171' },
];

export default function IntroScreen({ onStart, audioEnabled }) {
  const narrationRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (audioEnabled) {
      const t = setTimeout(() => {
        narrationRef.current = narrate(NARRATION.intro.narrationText, 'statement');
      }, 600);
      return () => {
        clearTimeout(t);
        if (narrationRef.current) narrationRef.current.cancel();
        stopNarration();
      };
    }
  }, [audioEnabled]);

  const handleStart = () => {
    if (narrationRef.current) narrationRef.current.cancel();
    stopNarration();
    audioController.playClick();
    onStart();
  };

  return (
    <div className="intro-screen">

      {/* ── Badge pill ── */}
      <div className="intro-badge" style={{ animationDelay: '0.1s' }}>
        ✨ &nbsp;Grade 3 Math&nbsp; · &nbsp;Fractions&nbsp; ✨
      </div>

      {/* ── Mascot row ── */}
      <div className="mascot-container">
        <div className="mascot">🦉</div>
        <div className="speech-bubble">
          Hi, I'm <strong>Leo!</strong> Ready to master fractions? 🚀
        </div>
      </div>

      {/* ── BIG colourful topic title (plain text, like reference) ── */}
      <h1 className="intro-hero-title">
        <span className="intro-title-yellow">Like Fractions —</span>{' '}
        <span className="intro-title-orange">Addition &amp; Subtraction</span>
      </h1>

      {/* ── Description ── */}
      <p className="intro-desc">
        Go on a <strong style={{ color: '#fbbf24' }}>festival adventure</strong> with John, Sarah, Mike &amp; Priya
        — and learn how to <strong style={{ color: '#34d399' }}>add</strong> and <strong style={{ color: '#f87171' }}>subtract</strong> fractions
        that share the same denominator!
      </p>

      {/* ── Journey map ── */}
      <div className="intro-journey-map">
        <div className="intro-journey-title">✨ Your Learning Journey ✨</div>
        <div className="intro-journey-steps">
          {JOURNEY.map((step, idx) => (
            <div key={step.label} className="intro-journey-step">
              <div
                className="intro-journey-icon"
                style={{ background: step.color + '22', border: `2px solid ${step.color}55` }}
              >
                {step.icon}
              </div>
              <div className="intro-journey-info">
                <div className="intro-journey-label" style={{ color: step.color }}>{step.label}</div>
                <div className="intro-journey-desc">{step.desc}</div>
              </div>
              {idx < JOURNEY.length - 1 && (
                <span className="intro-journey-arrow">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature cards (colourful) ── */}
      <div className="feature-cards">
        <div className="feature-card" style={{ borderColor: '#fbbf2455', background: '#fbbf2411' }}>
          <div className="feature-card-icon">🍕</div>
          <div className="feature-card-label" style={{ color: '#fbbf24' }}>Pizza &amp; Pie Sims</div>
        </div>
        <div className="feature-card" style={{ borderColor: '#60a5fa55', background: '#60a5fa11' }}>
          <div className="feature-card-icon">🎯</div>
          <div className="feature-card-label" style={{ color: '#60a5fa' }}>10 Random Qs</div>
        </div>
        <div className="feature-card" style={{ borderColor: '#34d39955', background: '#34d39911' }}>
          <div className="feature-card-icon">⭐</div>
          <div className="feature-card-label" style={{ color: '#34d399' }}>Stars &amp; Badges</div>
        </div>
        <div className="feature-card" style={{ borderColor: '#a78bfa55', background: '#a78bfa11' }}>
          <div className="feature-card-icon">🔊</div>
          <div className="feature-card-label" style={{ color: '#a78bfa' }}>Audio Narration</div>
        </div>
      </div>

      {/* ── Start button ── */}
      <button
        className="btn btn-primary btn-lg intro-start-btn"
        onClick={handleStart}
        id="start-lesson-btn"
      >
        Start Learning &nbsp;🚀
      </button>

      {/* ── Subtle skip link ── */}
      <button
        className="skip-link"
        onClick={handleStart}
        style={{ marginTop: '8px' }}
      >
        or skip to practice →
      </button>
    </div>
  );
}
