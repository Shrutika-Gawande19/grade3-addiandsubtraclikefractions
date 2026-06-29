import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { narrate, stopNarration, audioController } from '../utils/audio';
import { NARRATION } from '../utils/narration';

// Helper for SVG wedge path
function getWedgePath(cx, cy, r, startAngle, endAngle) {
  const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
  const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
  const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
  const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

export default function SimulatePhase({ onComplete, audioEnabled }) {
  const [station, setStation] = useState(0); // 0: Pizza, 1: Ribbon, 2: Pie Sort
  const narrationRef = useRef(null);

  // Trigger narration for the current station
  useEffect(() => {
    if (audioEnabled) {
      let scriptText = "";
      if (station === 0) scriptText = NARRATION.simulations.pizza.step1;
      else if (station === 1) scriptText = NARRATION.simulations.ribbon.step1;
      else if (station === 2) scriptText = NARRATION.simulations.pie.intro;

      const timer = setTimeout(() => {
        narrationRef.current = narrate(scriptText, 'instruction');
      }, 500);
      return () => {
        clearTimeout(timer);
        if (narrationRef.current) narrationRef.current.cancel();
        stopNarration();
      };
    }
  }, [station, audioEnabled]);

  const handleNextStation = () => {
    audioController.playClick();
    if (narrationRef.current) narrationRef.current.cancel();
    stopNarration();

    if (station < 2) {
      setStation(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 w-full max-w-4xl mx-auto mt-12">
      {/* Journey Station Index */}
      <div className="text-brand-gold font-display font-semibold text-xs tracking-wider uppercase mb-2">
        Simulation Module {station + 1} of 3
      </div>

      {/* Renders Active Simulation Container */}
      <div className="w-full">
        {station === 0 && (
          <PizzaStation onNext={handleNextStation} audioEnabled={audioEnabled} />
        )}
        {station === 1 && (
          <RibbonStation onNext={handleNextStation} audioEnabled={audioEnabled} />
        )}
        {station === 2 && (
          <PieStation onNext={handleNextStation} audioEnabled={audioEnabled} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 1: Pizza Builder (Addition)
// ═══════════════════════════════════════════════════
function PizzaStation({ onNext, audioEnabled }) {
  const [slices, setSlices] = useState(Array(8).fill(null)); // null | 'first' | 'second'
  const [done, setDone] = useState(false);
  const narRef = useRef(null);

  const firstCount = slices.filter(s => s === 'first').length;
  const secondCount = slices.filter(s => s === 'second').length;

  const handleSliceClick = (i) => {
    if (done) return;
    audioController.playClick();
    
    setSlices(prev => {
      const next = [...prev];
      if (next[i] === null) {
        if (firstCount < 2) {
          next[i] = 'first';
        } else if (secondCount < 3) {
          next[i] = 'second';
        }
      } else {
        next[i] = null;
      }
      return next;
    });
  };

  // Check completion
  useEffect(() => {
    if (firstCount === 2 && secondCount === 3 && !done) {
      setDone(true);
      audioController.playCorrect();
      if (audioEnabled) {
        narRef.current = narrate(NARRATION.simulations.pizza.success, 'celebration');
      }
    }
  }, [firstCount, secondCount, done, audioEnabled]);

  return (
    <div className="glass-card w-full flex flex-col md:flex-row items-center gap-8 mb-6 relative">
      {/* Pizza visual */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-orange-100/10 rounded-full border-4 border-amber-800/40 p-1 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {Array.from({ length: 8 }).map((_, i) => {
              const startAngle = i * 45;
              const endAngle = startAngle + 45;
              const path = getWedgePath(100, 100, 92, startAngle, endAngle);
              
              let fillColor = 'rgba(255, 235, 200, 0.15)';
              let strokeColor = 'rgba(255, 255, 255, 0.2)';
              
              if (slices[i] === 'first') {
                fillColor = '#FF8C42'; // Orange
                strokeColor = '#e66000';
              } else if (slices[i] === 'second') {
                fillColor = '#9B5DE5'; // Purple
                strokeColor = '#6d1cb8';
              }

              return (
                <path
                  key={i}
                  d={path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="1"
                  className="cursor-pointer hover:opacity-90 transition-all duration-150"
                  onClick={() => handleSliceClick(i)}
                />
              );
            })}
            <circle cx="100" cy="100" r="94" fill="none" stroke="#D4A373" strokeWidth="6" />
          </svg>
        </div>
      </div>

      {/* Instructions & Equation Builder */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        <div className="text-[#FF8C42] font-display font-bold text-sm tracking-wider uppercase mb-1">
          John's Addition Sim
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-3">
          Build Slices: 2/8 + 3/8
        </h3>
        
        {/* Dynamic Instruction */}
        <p className="text-brand-textSecondary text-sm font-body mb-6">
          {!done && firstCount < 2 && NARRATION.simulations.pizza.step1}
          {!done && firstCount === 2 && secondCount < 3 && NARRATION.simulations.pizza.step2}
          {done && <span className="text-brand-greenLight font-bold">🎉 Pizza Completed! Click below to advance!</span>}
        </p>

        {/* Dynamic Equation Card */}
        <div className="flex items-center gap-4 bg-black/45 p-6 rounded-2xl border border-white/10 mb-6 font-display text-2xl font-bold">
          {/* Fraction 1 */}
          <div className="flex flex-col items-center">
            <span className={firstCount === 2 ? "text-[#FF8C42]" : "text-white"}>{firstCount}</span>
            <div className="fraction-line"></div>
            <span>8</span>
          </div>
          <span className="text-brand-gold">+</span>
          {/* Fraction 2 */}
          <div className="flex flex-col items-center">
            <span className={secondCount === 3 ? "text-[#9B5DE5]" : "text-white"}>{secondCount}</span>
            <div className="fraction-line"></div>
            <span>8</span>
          </div>
          <span className="text-brand-gold">=</span>
          {/* Sum */}
          <div className="flex flex-col items-center">
            <span className={done ? "text-brand-green" : "text-white"}>{done ? "5" : "?"}</span>
            <div className="fraction-line"></div>
            <span>8</span>
          </div>
        </div>

        {/* Next station button */}
        {done && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onNext}
            className="btn btn-green shadow-glow w-full md:w-auto"
          >
            Sarah's Ribbon ➡️
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 2: Ribbon Cutter (Subtraction)
// ═══════════════════════════════════════════════════
function RibbonStation({ onNext, audioEnabled }) {
  // Start with 5 active segments (indices 0 to 4) out of 6
  const [segments, setSegments] = useState([true, true, true, true, true, false]);
  const [cuts, setCuts] = useState(new Set()); // indices cut
  const [done, setDone] = useState(false);
  const narRef = useRef(null);

  const initialCount = 5;
  const cutCount = cuts.size;
  const remainingCount = initialCount - cutCount;

  const handleSegmentClick = (idx) => {
    if (done) return;
    if (!segments[idx]) return; // Can't cut empty segments
    if (cuts.has(idx)) {
      audioController.playClick();
      setCuts(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    } else {
      audioController.playPop(); // Scissors snip
      setCuts(prev => {
        const next = new Set(prev);
        if (next.size < 2) {
          next.add(idx);
        }
        return next;
      });
    }
  };

  // Check completion
  useEffect(() => {
    if (cuts.size === 2 && !done) {
      setDone(true);
      audioController.playCorrect();
      if (audioEnabled) {
        narRef.current = narrate(NARRATION.simulations.ribbon.success, 'celebration');
      }
    }
  }, [cuts.size, done, audioEnabled]);

  return (
    <div className="glass-card w-full flex flex-col md:flex-row items-center gap-8 mb-6 relative">
      {/* Ribbon segments visual */}
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="w-full flex items-center justify-center p-6 bg-black/25 rounded-2xl border border-white/10 relative overflow-hidden">
          {/* Scissors mascot indicator */}
          <div className="absolute top-2 left-2 text-xs font-display text-brand-gold">
            ✂️ Tap segments to cut!
          </div>

          <div className="flex gap-2 w-full max-w-md h-12">
            {segments.map((active, i) => {
              const isCut = cuts.has(i);
              
              let bgColor = "bg-white/10 border-white/10"; // Empty segment
              if (active && !isCut) {
                bgColor = "bg-[#4CC9F0] border-sky-400 shadow-md"; // Active segment
              } else if (active && isCut) {
                bgColor = "bg-red-500/20 border-red-500/40 line-through text-red-300"; // Cut segment
              }

              return (
                <motion.div
                  key={i}
                  onClick={() => handleSegmentClick(i)}
                  className={`flex-1 h-full rounded-md border flex items-center justify-center cursor-pointer font-display text-xs transition-all duration-300 ${bgColor}`}
                  animate={isCut ? { y: 10, opacity: 0.5, scale: 0.95 } : { y: 0, opacity: 1, scale: 1 }}
                  whileHover={{ scale: active ? 1.05 : 1 }}
                >
                  {active && !isCut && <span className="text-white font-bold">{i + 1}/6</span>}
                  {active && isCut && <span className="text-red-300 font-bold">✂️</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions & Equation Builder */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
        <div className="text-[#4CC9F0] font-display font-bold text-sm tracking-wider uppercase mb-1">
          Sarah's Subtraction Sim
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-3">
          Cut segments: 5/6 − 2/6
        </h3>
        
        {/* Dynamic Instruction */}
        <p className="text-brand-textSecondary text-sm font-body mb-6">
          {!done && cuts.size < 2 && NARRATION.simulations.ribbon.step1}
          {done && <span className="text-brand-greenLight font-bold">🎉 Ribbon Cut! Click below to advance!</span>}
        </p>

        {/* Subtraction Equation Card */}
        <div className="flex items-center gap-4 bg-black/45 p-6 rounded-2xl border border-white/10 mb-6 font-display text-2xl font-bold">
          {/* Fraction 1 */}
          <div className="flex flex-col items-center text-[#4CC9F0]">
            <span>5</span>
            <div className="fraction-line"></div>
            <span>6</span>
          </div>
          <span className="text-brand-gold">−</span>
          {/* Fraction 2 */}
          <div className="flex flex-col items-center">
            <span className={cuts.size > 0 ? "text-brand-red" : "text-white"}>{cuts.size}</span>
            <div className="fraction-line"></div>
            <span>6</span>
          </div>
          <span className="text-brand-gold">=</span>
          {/* Result */}
          <div className="flex flex-col items-center">
            <span className={done ? "text-brand-green" : "text-white"}>{done ? "3" : "?"}</span>
            <div className="fraction-line"></div>
            <span>6</span>
          </div>
        </div>

        {/* Next CTA */}
        {done && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onNext}
            className="btn btn-green shadow-glow w-full md:w-auto"
          >
            Mike's Pie Sort ➡️
          </motion.button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STATION 3: Pie Sort Challenge (Combined)
// ═══════════════════════════════════════════════════
function PieStation({ onNext, audioEnabled }) {
  const [operator, setOperator] = useState(null); // '+' | '-' | null
  const [sliderVal, setSliderVal] = useState(0);
  const [done, setDone] = useState(false);
  const narRef = useRef(null);

  const handleOperatorSelect = (op) => {
    if (done) return;
    audioController.playClick();
    setOperator(op);
  };

  const handleSliderChange = (e) => {
    if (done) return;
    const val = parseInt(e.target.value);
    audioController.playClick();
    setSliderVal(val);
  };

  // Check completion
  useEffect(() => {
    if (operator === '+' && sliderVal === 4 && !done) {
      setDone(true);
      audioController.playCorrect();
      if (audioEnabled) {
        narRef.current = narrate(NARRATION.simulations.pie.success, 'celebration');
      }
    }
  }, [operator, sliderVal, done, audioEnabled]);

  return (
    <div className="glass-card w-full flex flex-col md:flex-row items-center gap-8 mb-6 relative">
      {/* Pie Wedge Visual */}
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-orange-100/10 rounded-full border-4 border-amber-800/40 p-1 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {Array.from({ length: 5 }).map((_, i) => {
              const startAngle = i * 72;
              const endAngle = startAngle + 72;
              const path = getWedgePath(100, 100, 92, startAngle, endAngle);
              
              let fillColor = 'rgba(255, 235, 200, 0.15)';
              let strokeColor = 'rgba(255, 255, 255, 0.2)';
              
              if (i < sliderVal) {
                fillColor = '#81C784'; // Green pie slice
                strokeColor = '#3b8b40';
              }

              return (
                <path
                  key={i}
                  d={path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
              );
            })}
            <circle cx="100" cy="100" r="94" fill="none" stroke="#D4A373" strokeWidth="6" />
          </svg>
        </div>
      </div>

      {/* Controls Area */}
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
        <div className="text-brand-gold font-display font-bold text-sm tracking-wider uppercase mb-1">
          Mike's Pastry Card
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-3">
          Sort Pie slices: 3/5 ? 1/5 = ?
        </h3>
        
        {/* Dynamic Instruction */}
        <p className="text-brand-textSecondary text-sm font-body mb-5">
          {!operator && NARRATION.simulations.pie.step1}
          {operator && !done && NARRATION.simulations.pie.step2}
          {done && <span className="text-brand-greenLight font-bold">🎉 Pie matches card! All set for the festival!</span>}
        </p>

        {/* Choice Step 1: Select operator */}
        <div className="flex gap-4 mb-5 w-full">
          <button
            onClick={() => handleOperatorSelect('+')}
            disabled={done}
            className={`flex-1 py-3 rounded-xl font-display font-bold text-xl border transition-all duration-200 ${
              operator === '+'
                ? 'bg-brand-gold text-[#1a1a2e] border-brand-gold shadow-md'
                : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
            }`}
          >
            ➕ Add (+)
          </button>
          <button
            onClick={() => handleOperatorSelect('-')}
            disabled={done}
            className={`flex-1 py-3 rounded-xl font-display font-bold text-xl border transition-all duration-200 ${
              operator === '-'
                ? 'bg-brand-red text-white border-brand-red'
                : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
            }`}
          >
            ➖ Subtract (−)
          </button>
        </div>

        {/* Choice Step 2: Slider answer value */}
        {operator && (
          <div className="w-full flex flex-col gap-2 mb-6">
            <div className="flex justify-between text-xs font-display text-brand-textSecondary">
              <span>Slider: {sliderVal} slices</span>
              <span>Result: {sliderVal}/5</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={sliderVal}
              onChange={handleSliderChange}
              disabled={done}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-gold"
            />
          </div>
        )}

        {/* Final equation display */}
        <div className="flex items-center gap-4 bg-black/45 p-5 rounded-2xl border border-white/10 mb-6 font-display text-xl font-bold">
          <div className="flex flex-col items-center">
            <span>3</span>
            <div className="fraction-line"></div>
            <span>5</span>
          </div>
          <span className="text-brand-gold">{operator || "?"}</span>
          <div className="flex flex-col items-center">
            <span>1</span>
            <div className="fraction-line"></div>
            <span>5</span>
          </div>
          <span className="text-brand-gold">=</span>
          <div className="flex flex-col items-center">
            <span className={done ? "text-brand-green" : "text-white"}>{sliderVal}/5</span>
          </div>
        </div>

        {/* Complete Station */}
        {done && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onNext}
            className="btn btn-green shadow-glow w-full md:w-auto"
          >
            Enter Practice Arena! 🎮
          </motion.button>
        )}
      </div>
    </div>
  );
}
