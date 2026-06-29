import { useEffect, useRef, useState } from 'react';
import { narrate, stopNarration, audioController } from '../utils/audio';
import { NARRATION } from '../utils/narration';

/*
  Structure mirrors equal-tau.vercel.app intro:
    .intro-screen  (full-viewport centered column)
      .intro-badge   (small pill label — subject + grade)
      .mascot-container  (owl + speech bubble)
      .intro-title   (big topic name)
      .intro-desc    (1-2 line description)
      .intro-journey-map  (glass panel with step icons → arrows)
      .intro-start-btn  (CTA)
*/

const JOURNEY = [
  { icon: '🔍', label: 'Wonder', desc: 'Explore the puzzle' },
  { icon: '📖', label: 'Story', desc: 'Meet the characters' },
  { icon: '🧪', label: 'Simulate', desc: 'Visual fractions' },
  { icon: '🎮', label: 'Play', desc: 'Practice challenges' },
  { icon: '🏆', label: 'Reflect', desc: 'Earn your badge!' },
];

export default function IntroScreen({ onStart, audioEnabled }) {
  const narrationRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Entrance animation trigger
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Narrate on mount
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
        ✨ &nbsp;Grade 3 Math&nbsp; · &nbsp; ✨
      </div>

      {/* ── Mascot row ── */}
      <div className="mascot-container">
        <div className="mascot">🦉</div>
        <div className="speech-bubble">
          Hi, I'm <strong>Leo!</strong> Ready to explore fractions?
        </div>
      </div>

      {/* ── Title (the topic name) ── */}
      <h1 className="intro-title">
        Addition &amp; Subtraction<br />
        of Related Fractions
      </h1>

      {/* ── Description ── */}
      <p className="intro-desc">
        Learn how to <strong>add</strong> and <strong>subtract</strong> fractions that share the same denominator through
        interactive stories, simulations, and gamified practice!
      </p>

      {/* ── Journey map ── */}
      <div className="intro-journey-map">
        <div className="intro-journey-title">Your Learning Journey</div>
        <div className="intro-journey-steps">
          {JOURNEY.map((step, idx) => (
            <div key={step.label} className="intro-journey-step">
              <div className="intro-journey-icon">{step.icon}</div>
              <div className="intro-journey-info">
                <div className="intro-journey-label">{step.label}</div>
                <div className="intro-journey-desc">{step.desc}</div>
              </div>
              {idx < JOURNEY.length - 1 && (
                <span className="intro-journey-arrow">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature cards (quick highlights) ── */}
      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-card-icon">🍕</div>
          <div className="feature-card-label">Pizza &amp; Pie Sims</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">🎯</div>
          <div className="feature-card-label">10 Random Qs</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">⭐</div>
          <div className="feature-card-label">Stars &amp; Badges</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">🔊</div>
          <div className="feature-card-label">Audio Narration</div>
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
