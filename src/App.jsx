import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/WonderPhase';
import StoryPhase from './components/StoryPhase';
import SimulatePhase from './components/SimulatePhase';
import FloatingNumbers from './components/FloatingNumbers';
import { generatePracticeSession } from './utils/fractionGenerator';
import { audioController, narrate, stopNarration, playBadgeFanfare } from './utils/audio';
import { NARRATION } from './utils/narration';

// ──────────────────────────────────────────────────
// Practice Arena — full quiz engine
// ──────────────────────────────────────────────────
import QuestionRenderer from './components/QuestionRenderer';

const PHASES = ['intro', 'wonder', 'story', 'simulate', 'practice', 'celebration'];

const JOURNEY_LABELS = [
  { icon: '🔍', label: 'Wonder' },
  { icon: '📖', label: 'Story' },
  { icon: '🧪', label: 'Simulate' },
  { icon: '🎮', label: 'Play' },
  { icon: '📓', label: 'Reflect' },
];

const BADGES = [
  { id: 'fraction-explorer', label: 'Fraction Explorer', icon: '🏆', desc: 'Completed the learning journey!' },
  { id: 'pizza-pro',         label: 'Pizza Pro',         icon: '🍕', desc: 'First correct answer in practice!' },
  { id: 'perfect-slicer',   label: 'Perfect Slicer',    icon: '⭐', desc: 'Scored 100% — all 10 correct!' },
];

function JourneyBar({ phase }) {
  const phaseIndex = PHASES.indexOf(phase);
  // map phase to journey step (intro=none, wonder=0, story=1, simulate=2, practice=3, celebration=4)
  const activeStep = phaseIndex - 1; // -1 for intro

  return (
    <div className="journey-bar">
      {JOURNEY_LABELS.map((step, idx) => {
        const isCompleted = idx < activeStep;
        const isActive    = idx === activeStep;
        return (
          <div key={step.label} className={`journey-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
            <div className="journey-step-dot">{isCompleted ? '✓' : step.icon}</div>
            <span className="journey-step-label">{step.label}</span>
            {idx < JOURNEY_LABELS.length - 1 && (
              <div className={`journey-connector ${isCompleted ? 'filled' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────
// Practice Arena Component
// ──────────────────────────────────────────────────
function PracticeArena({ onComplete, audioEnabled }) {
  const [questions]       = useState(() => generatePracticeSession());
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [disabled, setDisabled] = useState(false);
  const [xp, setXP]       = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [gotFirstRight, setGotFirstRight] = useState(false);

  const question = questions[current];
  const progress = (current / questions.length) * 100;

  const handleAnswer = useCallback((selected) => {
    if (disabled) return;
    setDisabled(true);

    const isCorrect = selected === question.answerText;
    const newAnswers = [...answers, { id: question.id, selected, correct: question.answerText, isCorrect }];
    setAnswers(newAnswers);

    if (isCorrect) {
      audioController.playCorrect();
      const streakBonus = streak >= 2 ? 5 : 0;
      setXP(prev => prev + 10 + streakBonus);
      setStreak(prev => prev + 1);
      setFeedback('correct');
      if (!gotFirstRight) setGotFirstRight(true);
      setTimeout(() => {
        setFeedback(null);
        setDisabled(false);
        setShowHint(false);
        setWrongCount(0);
        if (current < questions.length - 1) {
          setCurrent(prev => prev + 1);
        } else {
          onComplete(newAnswers, xp + 10 + (streak >= 2 ? 5 : 0));
        }
      }, 1400);
    } else {
      audioController.playWrong();
      setStreak(0);
      setFeedback('wrong');
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= 2) setShowHint(true);
      setTimeout(() => {
        setFeedback(null);
        setDisabled(false);
      }, 2200);
    }
  }, [disabled, question, answers, streak, current, questions.length, onComplete, xp, gotFirstRight, wrongCount]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 z-10 w-full max-w-3xl mx-auto mt-16">
      {/* Header strip */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="text-brand-gold font-display font-bold text-xs tracking-wider uppercase">
          Question {current + 1} / {questions.length}
        </div>
        <div className="flex items-center gap-3 text-xs font-display">
          <span className="text-brand-gold font-bold">⚡ {xp} XP</span>
          {streak >= 2 && <span className="text-brand-greenLight font-bold animate-pulse">🔥 Streak ×{streak}</span>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-container mb-6 w-full">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Main question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className={`glass-card w-full mb-4 relative overflow-hidden ${feedback === 'wrong' ? 'animate-shake border-brand-red/60' : ''} ${feedback === 'correct' ? 'border-brand-green/60' : ''}`}
          style={{ borderWidth: feedback ? '2px' : undefined }}
        >
          {/* Feedback overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 flex flex-col items-center justify-center z-20 rounded-2xl ${feedback === 'correct' ? 'bg-brand-green/20' : 'bg-brand-red/20'}`}
              >
                <span className="text-6xl mb-2">{feedback === 'correct' ? '✅' : '❌'}</span>
                <span className={`font-display font-bold text-xl ${feedback === 'correct' ? 'text-brand-greenLight' : 'text-brand-redLight'}`}>
                  {feedback === 'correct' ? `Correct! +${10 + (streak >= 2 ? 5 : 0)} XP` : `Not quite! Answer: ${question.answerText}`}
                </span>
                {feedback === 'correct' && streak >= 3 && (
                  <span className="text-brand-gold font-display text-sm mt-1 animate-bounce">🔥 Streak Bonus!</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <QuestionRenderer question={question} onAnswer={handleAnswer} disabled={disabled} />
        </motion.div>
      </AnimatePresence>

      {/* Hint panel */}
      {showHint && !feedback && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 bg-brand-purpleDeep/60 border border-brand-gold/30 rounded-2xl flex gap-3 items-start"
        >
          <span className="text-2xl flex-shrink-0">🦉</span>
          <div>
            <span className="text-brand-gold font-display font-semibold text-sm block mb-1">Leo's Hint</span>
            <p className="text-brand-textSecondary text-sm font-body">
              {question.type === 'addition'
                ? 'When adding like fractions, just add the top numbers (numerators)! The bottom number (denominator) stays the same.'
                : 'When subtracting like fractions, just subtract the top numbers (numerators)! The bottom number (denominator) stays the same.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────
// Celebration Screen
// ──────────────────────────────────────────────────
function CelebrationScreen({ answers, totalXP, badges, onReplay, onHome, audioEnabled }) {
  const correct = answers.filter(a => a.isCorrect).length;
  const pct = Math.round((correct / answers.length) * 100);
  const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

  useEffect(() => {
    audioController.playBadge();
    if (audioEnabled) {
      setTimeout(() => narrate(NARRATION.celebration.narrationText, 'celebration'), 800);
    }
    return () => stopNarration();
  }, [audioEnabled]);

  // CSS confetti via pseudo-elements (pure CSS approach)
  const confettiColors = ['#ffc107', '#4caf50', '#ef5350', '#9B5DE5', '#4CC9F0', '#FF8C42'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 z-10 w-full max-w-3xl mx-auto text-center relative">
      {/* Confetti pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${-10 - Math.random() * 20}%`,
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              background: confettiColors[i % confettiColors.length],
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animation: `floatAround ${15 + Math.random() * 20}s ${Math.random() * 5}s linear infinite`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="glass-card w-full z-10 relative"
      >
        {/* Hero section */}
        <div className="text-8xl mb-4 animate-bounce">🦸</div>
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          {NARRATION.celebration.title}
        </h1>
        <p className="text-brand-textSecondary font-body mb-6 max-w-lg mx-auto">
          {NARRATION.celebration.subtitle}
        </p>

        {/* Score card */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-3xl font-display font-bold text-brand-green">{correct}/{answers.length}</div>
            <div className="text-xs text-brand-textMuted font-body mt-1">Correct</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-3xl font-display font-bold text-brand-gold">⚡{totalXP}</div>
            <div className="text-xs text-brand-textMuted font-body mt-1">XP Earned</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="text-3xl font-display font-bold text-brand-goldLight">
              {'⭐'.repeat(stars)}{stars < 3 ? '☆'.repeat(3 - stars) : ''}
            </div>
            <div className="text-xs text-brand-textMuted font-body mt-1">Stars</div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-6">
            <div className="text-brand-gold font-display font-semibold text-sm mb-3 uppercase tracking-wider">
              🏅 Badges Unlocked
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {badges.map(b => (
                <motion.div
                  key={b.id}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                  className="flex flex-col items-center gap-1 bg-white/5 border border-brand-gold/30 rounded-xl p-3 min-w-[100px]"
                >
                  <span className="text-4xl">{b.icon}</span>
                  <span className="text-brand-gold font-display font-bold text-xs">{b.label}</span>
                  <span className="text-brand-textMuted font-body text-[10px] text-center">{b.desc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Leo mascot */}
        <div className="bg-brand-cardSolid/80 border border-white/10 p-4 rounded-2xl flex gap-3 text-left mb-6">
          <span className="text-2xl flex-shrink-0">🦉</span>
          <p className="text-brand-textSecondary text-sm font-body">{NARRATION.celebration.mascotText}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onReplay} className="btn btn-primary">
            🔁 Play Again
          </button>
          <button onClick={onHome} className="btn btn-outline">
            🏠 Back to Start
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Root App
// ──────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState('intro');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [practiceAnswers, setPracticeAnswers] = useState([]);
  const [totalXP, setTotalXP] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);



  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    audioController.setMuted(!next);
    if (!next) stopNarration();
  };

  const goToPhase = (nextPhase) => {
    stopNarration();
    setPhase(nextPhase);
  };

  const handlePracticeComplete = (answers, xp) => {
    const correct = answers.filter(a => a.isCorrect).length;
    const pct = Math.round((correct / answers.length) * 100);
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
    const bonusXP = stars * 25;
    const finalXP = xp + bonusXP;

    setPracticeAnswers(answers);
    setTotalXP(finalXP);

    // Award badges
    const awarded = [BADGES[0]]; // Fraction Explorer always
    if (answers.some(a => a.isCorrect)) awarded.push(BADGES[1]); // Pizza Pro
    if (correct === answers.length) awarded.push(BADGES[2]); // Perfect Slicer

    setEarnedBadges(awarded);
    playBadgeFanfare();
    goToPhase('celebration');
  };

  const handleReplay = () => {
    setPracticeAnswers([]);
    setTotalXP(0);
    setEarnedBadges([]);
    goToPhase('practice');
  };

  const handleHome = () => {
    setPracticeAnswers([]);
    setTotalXP(0);
    setEarnedBadges([]);
    stopNarration();
    setPhase('intro');
  };

  const showJourneyBar = phase !== 'intro' && phase !== 'celebration';
  const showHomeBtn    = phase !== 'intro' && phase !== 'celebration';

  return (
    <>
      {/* Floating animated background numbers */}
      <FloatingNumbers />

      {/* Journey progress bar */}
      {showJourneyBar && <JourneyBar phase={phase} />}

      {/* Home button */}
      {showHomeBtn && (
        <button className="home-btn" onClick={handleHome}>
          🏠 <span>Home</span>
        </button>
      )}

      {/* Audio toggle */}
      <button
        className="audio-toggle-btn"
        onClick={toggleAudio}
        title={audioEnabled ? 'Mute audio' : 'Enable audio'}
        aria-label={audioEnabled ? 'Mute audio' : 'Enable audio'}
      >
        {audioEnabled ? '🔊' : '🔇'}
      </button>

      {/* Main app container */}
      <div className="app-container">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <IntroScreen
                onStart={() => goToPhase('wonder')}
                audioEnabled={audioEnabled}
                onToggleAudio={toggleAudio}
              />
            </motion.div>
          )}

          {phase === 'wonder' && (
            <motion.div
              key="wonder"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <WonderPhase onNext={() => goToPhase('story')} audioEnabled={audioEnabled} />
            </motion.div>
          )}

          {phase === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <StoryPhase onNext={() => goToPhase('simulate')} audioEnabled={audioEnabled} />
            </motion.div>
          )}

          {phase === 'simulate' && (
            <motion.div
              key="simulate"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <SimulatePhase onComplete={() => goToPhase('practice')} audioEnabled={audioEnabled} />
            </motion.div>
          )}

          {phase === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <PracticeArena onComplete={handlePracticeComplete} audioEnabled={audioEnabled} />
            </motion.div>
          )}

          {phase === 'celebration' && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <CelebrationScreen
                answers={practiceAnswers}
                totalXP={totalXP}
                badges={earnedBadges}
                onReplay={handleReplay}
                onHome={handleHome}
                audioEnabled={audioEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
