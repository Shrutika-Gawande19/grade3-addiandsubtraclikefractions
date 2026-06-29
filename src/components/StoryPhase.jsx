import { useState, useEffect, useRef } from 'react';
import { narrate, stopNarration, audioController } from '../utils/audio';
import { NARRATION } from '../utils/narration';

export default function StoryPhase({ onNext, audioEnabled }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const narrationRef = useRef(null);

  const slides = NARRATION.story;

  useEffect(() => {
    if (audioEnabled && slides[activeSlide]) {
      const timer = setTimeout(() => {
        narrationRef.current = narrate(slides[activeSlide].narrationText, 'statement');
      }, 400);
      return () => {
        clearTimeout(timer);
        if (narrationRef.current) narrationRef.current.cancel();
        stopNarration();
      };
    }
  }, [activeSlide, audioEnabled]);

  const handleNextSlide = () => {
    audioController.playClick();
    if (narrationRef.current) narrationRef.current.cancel();
    stopNarration();

    if (activeSlide < slides.length - 1) {
      setActiveSlide(prev => prev + 1);
    } else {
      onNext();
    }
  };

  const handlePrevSlide = () => {
    if (activeSlide > 0) {
      audioController.playClick();
      if (narrationRef.current) narrationRef.current.cancel();
      stopNarration();
      setActiveSlide(prev => prev - 1);
    }
  };

  const currentSlide = slides[activeSlide];

  // Helper to draw character inline SVGs dynamically
  const renderCharacterAvatar = (characterName) => {
    switch (characterName) {
      case 'John':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#FFE6C7" stroke="#FF8C42" strokeWidth="3" />
            <circle cx="50" cy="42" r="22" fill="#FFA87D" />
            {/* Chef Hat */}
            <path d="M35 25 C35 12, 65 12, 65 25 Z" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2" />
            <rect x="38" y="24" width="24" height="6" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="42" cy="42" r="3.5" fill="#2D2D2D" />
            <circle cx="58" cy="42" r="3.5" fill="#2D2D2D" />
            {/* Smile */}
            <path d="M43 55 Q50 62 57 55" fill="none" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'Sarah':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#FFEAE9" stroke="#FF6B6B" strokeWidth="3" />
            <path d="M50 20 C25 20, 25 55, 50 55 C75 55, 75 20, 50 20 Z" fill="#FFB5B5" />
            <circle cx="50" cy="44" r="20" fill="#FFC8C8" />
            {/* Ribbon Headband */}
            <path d="M32 36 Q50 28 68 36" fill="none" stroke="#4CC9F0" strokeWidth="4" />
            <circle cx="40" cy="44" r="3" fill="#2D2D2D" />
            <circle cx="60" cy="44" r="3" fill="#2D2D2D" />
            <path d="M44 54 Q50 59 56 54" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'Mike':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#E8F1F2" stroke="#4CC9F0" strokeWidth="3" />
            {/* Hair/Cap */}
            <path d="M25 35 Q50 15 75 35 Z" fill="#FFB703" />
            <circle cx="50" cy="46" r="21" fill="#FFE5A3" />
            {/* Confused eyes/brows */}
            <path d="M37 38 L45 40" stroke="#2D2D2D" strokeWidth="2" />
            <path d="M63 38 L55 40" stroke="#2D2D2D" strokeWidth="2" />
            <circle cx="42" cy="45" r="3" fill="#2D2D2D" />
            <circle cx="58" cy="45" r="3" fill="#2D2D2D" />
            {/* Confused wiggly line mouth */}
            <path d="M43 57 Q47 54 50 57 T57 57" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'Priya':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="#EBF7EB" stroke="#6BCB77" strokeWidth="3" />
            <circle cx="50" cy="42" r="22" fill="#D3F8D3" />
            {/* Glasses */}
            <rect x="34" y="38" width="12" height="8" rx="2" fill="none" stroke="#555555" strokeWidth="2" />
            <rect x="54" y="38" width="12" height="8" rx="2" fill="none" stroke="#555555" strokeWidth="2" />
            <line x1="46" y1="42" x2="54" y2="42" stroke="#555555" strokeWidth="2" />
            <circle cx="40" cy="42" r="2.5" fill="#2D2D2D" />
            <circle cx="60" cy="42" r="2.5" fill="#2D2D2D" />
            <path d="M44 54 Q50 60 56 54" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      default:
        return <span>🦉</span>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 w-full max-w-4xl mx-auto mt-12">
      {/* Journey Header Info */}
      <div className="text-brand-gold font-display font-semibold text-xs tracking-wider uppercase mb-2">
        Slide {activeSlide + 1} of {slides.length} · Story Mode
      </div>

      {/* Slide Container: Dual Pane */}
      <div className="glass-card w-full flex flex-col md:flex-row items-center gap-8 mb-8 relative">
        {/* Left Visual Pane */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/10">
          {/* Large Avatar container */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 border border-white/10 p-2 shadow-lg mb-4 flex items-center justify-center">
            {renderCharacterAvatar(currentSlide.character)}
          </div>
          <span className="text-white font-display font-bold text-xl">{currentSlide.character}</span>
          <span className="text-brand-gold font-display text-xs uppercase tracking-widest mt-1 font-bold">
            {currentSlide.characterRole}
          </span>
        </div>

        {/* Right Content Pane */}
        <div className="w-full md:w-2/3 flex flex-col items-center md:items-start text-center md:text-left">
          {/* speech label */}
          <div className="character-badge self-center md:self-start">
            <span className="text-lg">🗣️</span>
            <span className="text-white font-display font-semibold text-sm">Dialogue</span>
          </div>
          
          {/* Main text speech */}
          <p className="text-white text-lg md:text-xl font-body leading-relaxed mb-6">
            "{currentSlide.text}"
          </p>

          {/* Core concept takeaway panel */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6 w-full font-body text-xs text-brand-gold leading-relaxed flex items-start gap-2.5">
            <span className="text-lg">💡</span>
            <div>
              <strong className="block mb-0.5">Fraction Key Rule:</strong>
              {currentSlide.highlight}
            </div>
          </div>

          {/* Navigation controls inside card */}
          <div className="flex justify-between items-center w-full mt-4">
            <button
              onClick={handlePrevSlide}
              disabled={activeSlide === 0}
              className={`btn btn-sm btn-outline ${activeSlide === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              ⬅️ Back
            </button>
            <button
              onClick={handleNextSlide}
              className="btn btn-sm btn-primary"
            >
              {activeSlide === slides.length - 1 ? 'Go to Simulator 🧪' : 'Next Story ➡️'}
            </button>
          </div>
        </div>
      </div>

      {/* Mascot bubble */}
      <div className="bg-brand-cardSolid/80 border border-white/10 p-4 rounded-2xl max-w-xl shadow-lg relative flex gap-3 text-left w-full">
        <span className="text-2xl flex-shrink-0">🦉</span>
        <p className="text-brand-textSecondary text-sm font-body">
          <strong>Leo: </strong>{currentSlide.mascotText}
        </p>
      </div>
    </div>
  );
}
