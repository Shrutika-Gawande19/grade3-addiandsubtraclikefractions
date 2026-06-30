import { useState, useEffect, useRef } from 'react';
import { narrate, stopNarration, audioController } from '../utils/audio';

/* ─────────────────────────────────────────────────
   STORY DATA  — one complete narrative that teaches
   both ADDITION and SUBTRACTION of like fractions
───────────────────────────────────────────────── */
const STORY_SLIDES = [
  {
    id: 1,
    title: "The Festival Begins!",
    image: "/images/story_pizza_john.png",
    imageAlt: "John the pizza chef with a fraction pizza",
    character: "John",
    characterRole: "Pizza Chef 🍕",
    avatarBg: "linear-gradient(135deg,#ff8c42,#ff6b00)",
    avatarEmoji: "👨‍🍳",
    text: "Hi! I'm John, the festival pizza chef. I sliced my specialty pizza into 8 equal pieces. In the morning I ate 2/8 of it. In the afternoon I ate 3/8 more. Can you help me figure out how much I ate in total?",
    equation: "2/8  +  3/8  =  5/8",
    equationColor: "#ff8c42",
    concept: "ADDING Like Fractions",
    conceptIcon: "➕",
    conceptColor: "linear-gradient(135deg,#ff8c42 0%,#ff6b00 100%)",
    highlight: "When the denominators are the same, just ADD the numerators! The bottom number never changes because the slice size stays the same.",
    lessonTag: "Addition",
    mascotText: "2 eighths + 3 eighths = 5 eighths! The pizza still has 8 slices — we just counted more! 🍕",
    narrationText: "John baked a pizza cut into 8 equal slices. He ate two eighths in the morning and three eighths in the afternoon. We add the top numbers: two plus three equals five. So John ate five eighths of the pizza! The denominator stays eight because the slices are the same size.",
  },
  {
    id: 2,
    title: "What Did We Learn? (Addition)",
    image: "/images/story_pizza_john.png",
    imageAlt: "Fraction addition rule with pizza slices",
    character: "Leo the Owl",
    characterRole: "Your Guide 🦉",
    avatarBg: "linear-gradient(135deg,#ffc107,#f9a825)",
    avatarEmoji: "🦉",
    text: "Let's remember what John taught us! When we add fractions with the same denominator, we only add the numerators. The denominator STAYS the same because the size of each piece doesn't change!",
    equation: "a/n  +  b/n  =  (a+b)/n",
    equationColor: "#ffc107",
    concept: "The Addition Rule",
    conceptIcon: "📏",
    conceptColor: "linear-gradient(135deg,#ffc107 0%,#f9a825 100%)",
    highlight: "Rule: Numerator + Numerator ÷ Same Denominator. Example: 2/8 + 3/8 = (2+3)/8 = 5/8",
    lessonTag: "Addition",
    mascotText: "Say it with me: same bottom, add the top! You're getting it! 🌟",
    narrationText: "The addition rule for like fractions is simple. Keep the denominator the same, and add only the numerators. Two eighths plus three eighths equals five eighths. The pizza still has eight slices!",
  },
  {
    id: 3,
    title: "Sarah's Ribbon Problem",
    image: "/images/story_ribbon_sarah.png",
    imageAlt: "Sarah the ribbon decorator subtracting fractions",
    character: "Sarah",
    characterRole: "Ribbon Decorator 🎀",
    avatarBg: "linear-gradient(135deg,#4cc9f0,#2196f3)",
    avatarEmoji: "👧",
    text: "Hello! I'm Sarah! I'm decorating the festival gates with beautiful ribbons. I have 5/6 of a ribbon. I use 2/6 of it to wrap a gift box for my friend. How much ribbon do I have left?",
    equation: "5/6  −  2/6  =  3/6",
    equationColor: "#4cc9f0",
    concept: "SUBTRACTING Like Fractions",
    conceptIcon: "➖",
    conceptColor: "linear-gradient(135deg,#4cc9f0 0%,#2196f3 100%)",
    highlight: "When the denominators are the same, just SUBTRACT the numerators! The denominator stays the same — the ribbon sections are still the same size.",
    lessonTag: "Subtraction",
    mascotText: "5 sixths minus 2 sixths = 3 sixths. Sarah still has plenty of ribbon for more decorations! 🎀",
    narrationText: "Sarah has five sixths of a ribbon. She cuts away two sixths to wrap a gift box. We subtract the numerators: five minus two equals three. Sarah has three sixths of ribbon left! The denominator stays six.",
  },
  {
    id: 4,
    title: "What Did We Learn? (Subtraction)",
    image: "/images/story_ribbon_sarah.png",
    imageAlt: "Fraction subtraction rule with ribbon",
    character: "Leo the Owl",
    characterRole: "Your Guide 🦉",
    avatarBg: "linear-gradient(135deg,#ffc107,#f9a825)",
    avatarEmoji: "🦉",
    text: "Great! Sarah showed us subtraction of like fractions. Just like addition, the denominator stays the same. We only subtract the numerators. Remember: same bottom, subtract the top!",
    equation: "a/n  −  b/n  =  (a−b)/n",
    equationColor: "#6bcb77",
    concept: "The Subtraction Rule",
    conceptIcon: "📏",
    conceptColor: "linear-gradient(135deg,#6bcb77 0%,#43a047 100%)",
    highlight: "Rule: Numerator − Numerator ÷ Same Denominator. Example: 5/6 − 2/6 = (5−2)/6 = 3/6",
    lessonTag: "Subtraction",
    mascotText: "Same bottom, subtract the top! Now you know BOTH rules! 🎉",
    narrationText: "The subtraction rule for like fractions works the same way as addition. Keep the denominator, subtract the numerators. Five sixths minus two sixths equals three sixths!",
  },
  {
    id: 5,
    title: "Mike Needs Your Help!",
    image: "/images/story_pie_mike.png",
    imageAlt: "Mike the pie baker with fraction pies",
    character: "Mike",
    characterRole: "Pie Baker 🥧",
    avatarBg: "linear-gradient(135deg,#b983ff,#7c3aed)",
    avatarEmoji: "🧑‍🍳",
    text: "Oh no! I'm Mike and I mixed up my pie equation cards! Some show addition and some show subtraction. Let me give you one to try: 3/5 + 1/5 = ? And another: 4/5 − 2/5 = ? Can you work them out?",
    equation: "3/5 + 1/5 = 4/5  |  4/5 − 2/5 = 2/5",
    equationColor: "#b983ff",
    concept: "Addition AND Subtraction Together!",
    conceptIcon: "🧩",
    conceptColor: "linear-gradient(135deg,#b983ff 0%,#7c3aed 100%)",
    highlight: "Whether you add or subtract, the denominator ALWAYS stays the same for like fractions. Only the numerator changes!",
    lessonTag: "Both Operations",
    mascotText: "Look at the sign first (+ or −), then solve the numerator. You're a fraction expert! 🧩",
    narrationText: "Mike needs help with two equations. Three fifths plus one fifth equals four fifths. And four fifths minus two fifths equals two fifths. Whether adding or subtracting like fractions, the denominator always stays the same!",
  },
  {
    id: 6,
    title: "You're a Fraction Hero!",
    image: "/images/story_priya_festival.png",
    imageAlt: "Priya celebrating the Fraction Festival",
    character: "Priya",
    characterRole: "Festival Organizer 🏆",
    avatarBg: "linear-gradient(135deg,#6bcb77,#43a047)",
    avatarEmoji: "👩‍💼",
    text: "Amazing! You helped everyone at the Fraction Festival! Now you know how to add AND subtract like fractions. You've got the TWO golden rules: same denominator — add or subtract ONLY the numerators. The festival gates are open — let's celebrate! 🎉",
    equation: "a/n ± b/n = (a ± b)/n",
    equationColor: "#6bcb77",
    concept: "You Know Both Rules! 🏆",
    conceptIcon: "🏆",
    conceptColor: "linear-gradient(135deg,#6bcb77 0%,#43a047 100%)",
    highlight: "GOLDEN RULE: For like fractions, the denominator stays the same. Add or subtract ONLY the numerators. That's it!",
    lessonTag: "Summary",
    mascotText: "You did it! Now head to the Simulator to see these rules come alive with pizza and ribbons! 🚀",
    narrationText: "Congratulations! You have learned the golden rule of like fractions. Whether adding or subtracting, the denominator stays the same. Only the numerators change. You are now a Fraction Hero! Let's go to the simulator to practice!",
  },
];

export default function StoryPhase({ onNext, audioEnabled }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const narrationRef = useRef(null);

  const slide = STORY_SLIDES[activeSlide];
  const totalSlides = STORY_SLIDES.length;

  useEffect(() => {
    if (audioEnabled && slide) {
      const timer = setTimeout(() => {
        narrationRef.current = narrate(slide.narrationText, 'statement');
      }, 400);
      return () => {
        clearTimeout(timer);
        if (narrationRef.current) narrationRef.current.cancel();
        stopNarration();
      };
    }
  }, [activeSlide, audioEnabled]);

  const goToSlide = (dir) => {
    if (animating) return;
    if (narrationRef.current) narrationRef.current.cancel();
    stopNarration();
    setAnimating(true);
    setTimeout(() => {
      setActiveSlide(prev => prev + dir);
      setAnimating(false);
    }, 220);
  };

  const handleNext = () => {
    audioController.playClick();
    if (activeSlide < totalSlides - 1) goToSlide(1);
    else onNext();
  };

  const handlePrev = () => {
    if (activeSlide > 0) {
      audioController.playClick();
      goToSlide(-1);
    }
  };

  return (
    <div className="story-phase-wrapper">
      {/* ── Slide counter ── */}
      <div className="story-counter">
        <span className="story-counter-text">
          {activeSlide + 1} / {totalSlides}
        </span>
        <div className="story-progress-track">
          {STORY_SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={`story-pip ${i === activeSlide ? 'active' : i < activeSlide ? 'done' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* ── Main Story Card ── */}
      <div className={`story-card-modern ${animating ? 'slide-out' : 'slide-in'}`}>

        {/* Image panel */}
        <div className="story-image-panel">
          <img
            src={slide.image}
            alt={slide.imageAlt}
            className="story-illustration"
          />
          {/* Floating lesson tag */}
          <div
            className="story-lesson-tag"
            style={{ background: slide.conceptColor }}
          >
            {slide.conceptIcon} {slide.lessonTag}
          </div>
          {/* Equation pill on the image */}
          <div className="story-equation-pill" style={{ color: slide.equationColor }}>
            {slide.equation}
          </div>
        </div>

        {/* Content panel */}
        <div className="story-content-panel">
          {/* Title */}
          <h2 className="story-slide-title">{slide.title}</h2>

          {/* Character row */}
          <div className="story-character-row">
            <div
              className="story-avatar"
              style={{ background: slide.avatarBg }}
            >
              <span className="story-avatar-emoji">{slide.avatarEmoji}</span>
            </div>
            <div className="story-character-info">
              <span className="story-character-name">{slide.character}</span>
              <span className="story-character-role">{slide.characterRole}</span>
            </div>
          </div>

          {/* Dialogue */}
          <div className="story-dialogue-bubble">
            <span className="story-dialogue-icon">🗣️</span>
            <p className="story-dialogue-text">"{slide.text}"</p>
          </div>

          {/* Concept highlight */}
          <div
            className="story-concept-box"
            style={{ borderColor: slide.equationColor + '55', background: slide.equationColor + '11' }}
          >
            <span className="story-concept-icon">{slide.conceptIcon}</span>
            <div>
              <strong className="story-concept-name" style={{ color: slide.equationColor }}>
                {slide.concept}
              </strong>
              <p className="story-concept-rule">{slide.highlight}</p>
            </div>
          </div>

          {/* Mascot line */}
          <div className="story-mascot-row">
            <div className="story-mascot-avatar">🦉</div>
            <div className="story-mascot-bubble">
              <strong>Leo: </strong>{slide.mascotText}
            </div>
          </div>

          {/* Navigation */}
          <div className="story-nav-row">
            <button
              className="btn btn-sm btn-outline"
              onClick={handlePrev}
              disabled={activeSlide === 0}
              style={{ opacity: activeSlide === 0 ? 0.3 : 1 }}
            >
              ← Back
            </button>
            <button
              className="btn btn-sm btn-primary story-next-btn"
              onClick={handleNext}
            >
              {activeSlide === totalSlides - 1 ? '🧪 Go to Simulator' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
