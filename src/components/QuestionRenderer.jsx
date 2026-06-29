import { useState, useEffect } from 'react';
import { audioController } from '../utils/audio';

// Helper for SVG wedge path
function getWedgePath(cx, cy, r, startAngle, endAngle) {
  const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
  const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
  const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
  const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

export default function QuestionRenderer({ question, onAnswer, disabled }) {
  const [numInput, setNumInput] = useState('');
  
  // Reset input when question changes
  useEffect(() => {
    setNumInput('');
  }, [question.id]);

  const handleOptionClick = (opt) => {
    if (disabled) return;
    audioController.playClick();
    onAnswer(opt);
  };

  const handleFillSubmit = (e) => {
    e.preventDefault();
    if (disabled || !numInput) return;
    audioController.playClick();
    
    // Format input as "num/denom"
    const ans = `${numInput.trim()}/${question.denom}`;
    onAnswer(ans);
  };

  // Renders dynamic SVGs to show the visual of the math problem
  const renderVisual = () => {
    const { type, a, b, denom, visualType } = question;
    
    if (visualType === 'pizza') {
      // Draw Pizza Addition slices
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl mb-4">
          <span className="text-xs font-display text-brand-gold mb-2">Visual Pizzas: {a}/{denom} + {b}/{denom}</span>
          <div className="flex gap-4">
            {/* First addend */}
            <div className="w-20 h-20 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {Array.from({ length: denom }).map((_, i) => {
                  const path = getWedgePath(50, 50, 44, i * (360 / denom), (i + 1) * (360 / denom));
                  return (
                    <path
                      key={i}
                      d={path}
                      fill={i < a ? '#FF8C42' : 'rgba(255,255,255,0.08)'}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="0.8"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="46" fill="none" stroke="#D4A373" strokeWidth="3" />
              </svg>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/70 px-1 text-[10px] rounded text-white font-display">
                {a}/{denom}
              </div>
            </div>
            <span className="text-xl text-brand-gold self-center">+</span>
            {/* Second addend */}
            <div className="w-20 h-20 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {Array.from({ length: denom }).map((_, i) => {
                  const path = getWedgePath(50, 50, 44, i * (360 / denom), (i + 1) * (360 / denom));
                  return (
                    <path
                      key={i}
                      d={path}
                      fill={i < b ? '#9B5DE5' : 'rgba(255,255,255,0.08)'}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="0.8"
                    />
                  );
                })}
                <circle cx="50" cy="50" r="46" fill="none" stroke="#D4A373" strokeWidth="3" />
              </svg>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/70 px-1 text-[10px] rounded text-white font-display">
                {b}/{denom}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Draw Ribbon Subtraction segments
      const activeCount = a;
      const removeCount = b;
      return (
        <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl mb-4 w-full">
          <span className="text-xs font-display text-brand-gold mb-2">Visual Ribbon: {a}/{denom} - {b}/{denom}</span>
          <div className="flex gap-1.5 w-full max-w-xs h-8 bg-black/25 p-1 rounded">
            {Array.from({ length: denom }).map((_, i) => {
              let fillClass = "bg-white/5 border-white/10";
              if (i < activeCount) {
                fillClass = i < activeCount - removeCount 
                  ? "bg-[#4CC9F0] border-sky-400" 
                  : "bg-red-500/25 border-red-500/40 line-through text-red-300";
              }
              return (
                <div
                  key={i}
                  className={`flex-1 h-full rounded border flex items-center justify-center text-[8px] font-bold font-display ${fillClass}`}
                >
                  {i < activeCount && i >= activeCount - removeCount && "✂️"}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-brand-textMuted font-body mt-2">
            Start: {a}/{denom} · Subtracting: {b}/{denom}
          </div>
        </div>
      );
    }
  };

  // Helper to render character icon
  const getAvatarEmoji = (char) => {
    switch (char) {
      case 'John': return '👨‍🍳';
      case 'Sarah': return '👩‍🎨';
      case 'Mike': return '👨‍🍳';
      case 'Priya': return '👩‍🏫';
      default: return '🦉';
    }
  };

  // Let's decide which question input mode to show:
  // We alternate equation types to keep the student engaged.
  // We show option buttons for MCQs, and numerator inputs for fill-in-the-numerator.
  
  // Determine if it is a fill-in-the-numerator question (Type B)
  const isFillNumerator = question.id.includes('sub-eq') || question.id.includes('sub-wp-1');

  return (
    <div className="w-full flex flex-col items-center">
      {/* Visual panel if it's a word problem or has visuals */}
      {question.format === 'word-problem' && (
        <div className="w-full bg-brand-purpleDeep/30 border border-white/10 rounded-2xl p-5 mb-6 text-left flex gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full border border-brand-gold flex items-center justify-center text-3xl flex-shrink-0">
            {getAvatarEmoji(question.character)}
          </div>
          <div className="flex-1">
            <span className="text-brand-gold font-display font-semibold text-xs block mb-1">
              {question.character}'s Word Puzzle
            </span>
            <p className="text-white font-body text-base leading-relaxed">
              "{question.questionText}"
            </p>
          </div>
        </div>
      )}

      {/* Visual representations (pizzas/ribbons) */}
      {renderVisual()}

      {/* Math Card Display */}
      <div className="bg-black/30 border border-white/10 rounded-2xl p-6 mb-6 flex flex-col items-center justify-center min-w-[240px]">
        {/* Math Question Text */}
        <div className="font-display text-3xl font-bold text-white tracking-wide">
          {question.equationText}
        </div>
      </div>

      {/* Input Options Pane */}
      {isFillNumerator ? (
        // Type B: Fill-in the Numerator Form
        <form onSubmit={handleFillSubmit} className="flex flex-col items-center gap-4 w-full max-w-sm">
          <div className="text-brand-gold font-display font-semibold text-sm">
            Fill in the numerator:
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <input
                type="number"
                min="0"
                max={question.denom}
                value={numInput}
                onChange={(e) => setNumInput(e.target.value)}
                disabled={disabled}
                placeholder="?"
                className="num-input"
                autoFocus
              />
              <div className="fraction-line !w-16"></div>
              <span className="font-display font-bold text-2xl text-white">{question.denom}</span>
            </div>
            <button
              type="submit"
              disabled={disabled || !numInput}
              className={`btn btn-sm btn-primary py-3 px-6 h-12 rounded-xl flex items-center justify-center font-display font-bold ${
                disabled || !numInput ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              Check Answer!
            </button>
          </div>
        </form>
      ) : (
        // Type A: Choose from 3 Options buttons
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <div className="text-brand-gold font-display font-semibold text-sm mb-1">
            Choose the correct option:
          </div>
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionClick(opt)}
              disabled={disabled}
              className={`w-full py-4 px-6 rounded-2xl border text-left font-display text-lg font-bold text-white transition-all duration-200 ${
                disabled
                  ? 'bg-white/5 border-white/5 cursor-not-allowed'
                  : 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transform hover:-translate-y-0.5'
              }`}
            >
              <span className="text-brand-gold mr-3">●</span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
