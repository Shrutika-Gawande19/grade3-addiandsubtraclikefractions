import { useEffect, useState, useRef } from 'react';
import { narrate, stopNarration, audioController } from '../utils/audio';
import { NARRATION } from '../utils/narration';

// Helper to calculate SVG wedge path
function getWedgePath(cx, cy, r, startAngle, endAngle) {
  const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
  const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
  const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
  const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

export default function WonderPhase({ onNext, audioEnabled }) {
  const narrationRef = useRef(null);
  const [selectedSlices, setSelectedSlices] = useState(Array(8).fill(null)); // null | 'morning' | 'afternoon'

  useEffect(() => {
    if (audioEnabled) {
      const timer = setTimeout(() => {
        narrationRef.current = narrate(NARRATION.wonder.narrationText, 'statement');
      }, 500);
      return () => {
        clearTimeout(timer);
        if (narrationRef.current) narrationRef.current.cancel();
        stopNarration();
      };
    }
  }, [audioEnabled]);

  const handleSliceClick = (index) => {
    audioController.playClick();
    setSelectedSlices(prev => {
      const next = [...prev];
      if (next[index] === null) {
        // Find how many morning/afternoon slices are colored
        const morningCount = next.filter(s => s === 'morning').length;
        if (morningCount < 2) {
          next[index] = 'morning';
        } else {
          const afternoonCount = next.filter(s => s === 'afternoon').length;
          if (afternoonCount < 3) {
            next[index] = 'afternoon';
          } else {
            next[index] = null;
          }
        }
      } else if (next[index] === 'morning') {
        next[index] = 'afternoon';
      } else {
        next[index] = null;
      }
      return next;
    });
  };

  const morningCount = selectedSlices.filter(s => s === 'morning').length;
  const afternoonCount = selectedSlices.filter(s => s === 'afternoon').length;
  const totalCount = morningCount + afternoonCount;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 w-full max-w-4xl mx-auto mt-12">
      {/* Title */}
      <h2 className="text-3xl font-display font-bold text-white mb-6">
        Let's Wonder... 🔍
      </h2>

      {/* Main Glass Card */}
      <div className="glass-card w-full flex flex-col md:flex-row items-center gap-8 mb-8 relative">
        {/* Visual Pizza Area */}
        <div className="flex flex-col items-center flex-1">
          <div className="relative w-64 h-64 md:w-80 md:h-80 bg-orange-100/10 rounded-full border-4 border-amber-800/40 p-1 shadow-lg flex items-center justify-center">
            {/* Interactive SVG Pizza */}
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              {Array.from({ length: 8 }).map((_, i) => {
                const startAngle = i * 45;
                const endAngle = startAngle + 45;
                const path = getWedgePath(100, 100, 92, startAngle, endAngle);
                
                // Color based on state
                let fillColor = 'rgba(255, 235, 200, 0.15)'; // Empty slice
                let strokeColor = 'rgba(255, 255, 255, 0.2)';
                let strokeWidth = '1';
                
                if (selectedSlices[i] === 'morning') {
                  fillColor = '#FF8C42'; // John's breakfast (Orange)
                  strokeColor = '#e66000';
                  strokeWidth = '1.5';
                } else if (selectedSlices[i] === 'afternoon') {
                  fillColor = '#9B5DE5'; // John's snack (Purple)
                  strokeColor = '#6d1cb8';
                  strokeWidth = '1.5';
                }

                return (
                  <path
                    key={i}
                    d={path}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="cursor-pointer hover:opacity-90 transition-all duration-200"
                    onClick={() => handleSliceClick(i)}
                  />
                );
              })}
              {/* Outer crust */}
              <circle cx="100" cy="100" r="94" fill="none" stroke="#D4A373" strokeWidth="6" />
              {/* Pizza toppings placeholder/dots for aesthetic details */}
              <circle cx="100" cy="100" r="4" fill="#A83232" />
            </svg>
            
            {/* Interactive overlay instructions inside pizza center */}
            {totalCount === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-black/60 text-white font-display text-xs px-3 py-1.5 rounded-full border border-white/10 animate-bounce">
                  Tap slices! 🍕
                </span>
              </div>
            )}
          </div>

          {/* Interactive Info Board */}
          <div className="mt-4 flex gap-4 text-xs font-display">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#FF8C42]"></span>
              <span className="text-brand-textSecondary">Morning: {morningCount}/8</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#9B5DE5]"></span>
              <span className="text-brand-textSecondary">Afternoon: {afternoonCount}/8</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-brand-gold">Total Eaten: {totalCount}/8</span>
            </div>
          </div>
        </div>

        {/* Text Riddle Area */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-brand-gold font-display font-bold text-sm tracking-wider uppercase mb-2">
            The Pizza Dilemma
          </div>
          <h3 className="text-2xl font-display font-semibold text-white mb-4 leading-snug">
            {NARRATION.wonder.question}
          </h3>
          <p className="text-brand-textSecondary font-body mb-6 text-sm leading-relaxed">
            {NARRATION.wonder.subQuestion}
          </p>

          <div className="p-4 bg-brand-purpleDeep/40 border border-brand-purpleLight/20 rounded-xl mb-6 w-full font-body text-xs text-brand-textSecondary leading-relaxed">
            <strong>Think about it:</strong> Do we eat <code className="text-brand-gold bg-black/35 px-1.5 py-0.5 rounded">5/8</code> of a pizza or <code className="text-brand-gold bg-black/35 px-1.5 py-0.5 rounded">5/16</code>? Does the size of each slice change when you add them up? Let's check!
          </div>

          {/* Next CTA */}
          <button
            onClick={() => {
              audioController.playClick();
              onNext();
            }}
            className="btn btn-green shadow-md w-full md:w-auto"
          >
            See the Answer! 📖
          </button>
        </div>
      </div>

      {/* Mascot bubble */}
      <div className="bg-brand-cardSolid/80 border border-white/10 p-4 rounded-2xl max-w-xl shadow-lg relative flex gap-3 text-left w-full">
        <span className="text-2xl flex-shrink-0">🦉</span>
        <p className="text-brand-textSecondary text-sm font-body">
          {NARRATION.wonder.mascotText}
        </p>
      </div>
    </div>
  );
}
