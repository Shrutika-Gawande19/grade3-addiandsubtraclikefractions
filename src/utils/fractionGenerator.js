// ──────────────────────────────────────────────────
// Like-Fraction Question Generator Engine
// Denominators: 2, 3, 4, 5, 6, 8, 10
// ──────────────────────────────────────────────────

const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10];

const WORD_PROBLEM_TEMPLATES = {
  addition: [
    {
      text: (a, b, d) => `John baked a pizza cut into ${d} equal slices. He ate ${a}/${d} of it in the morning and ${b}/${d} in the afternoon. How much pizza did he eat altogether?`,
      character: "John",
      unit: "pizza"
    },
    {
      text: (a, b, d) => `Priya painted ${a}/${d} of a festival banner before lunch, and ${b}/${d} of it after lunch. How much of the banner did she paint in total?`,
      character: "Priya",
      unit: "banner"
    },
    {
      text: (a, b, d) => `Sarah used ${a}/${d} of a ribbon to decorate a gift box, and ${b}/${d} to decorate a frame. How much ribbon did she use in total?`,
      character: "Sarah",
      unit: "ribbon"
    }
  ],
  subtraction: [
    {
      text: (a, b, d) => `Sarah had ${a}/${d} of a ribbon. She cut away ${b}/${d} of it to wrap a gift. How much ribbon is left?`,
      character: "Sarah",
      unit: "ribbon"
    },
    {
      text: (a, b, d) => `Mike filled ${a}/${d} of a baking tray with pie dough. If he baked and ate ${b}/${d} of it, how much pie dough remains in the tray?`,
      character: "Mike",
      unit: "dough"
    },
    {
      text: (a, b, d) => `Priya had ${a}/${d} of a roll of banner paper. She used ${b}/${d} of it for a festival stall. What fraction of the paper roll does she have left?`,
      character: "Priya",
      unit: "paper"
    }
  ]
};

// Helper to generate a random element from an array
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate random like-fraction addition problem (result <= 1)
export function generateAdditionProblem() {
  const denom = sample(DENOMINATORS);
  const a = Math.floor(Math.random() * (denom - 1)) + 1; // 1 to denom-1
  const maxB = denom - a;                                 // ensure a+b <= denom
  const b = Math.floor(Math.random() * maxB) + 1;        // 1 to maxB
  const correctNum = a + b;

  return {
    type: 'addition',
    a,
    b,
    denom,
    answerNum: correctNum,
    answerText: `${correctNum}/${denom}`,
    equationText: `${a}/${denom} + ${b}/${denom} = ?`,
    visualType: 'pizza'
  };
}

// Generate random like-fraction subtraction problem (result > 0)
export function generateSubtractionProblem() {
  const denom = sample(DENOMINATORS);
  const a = Math.floor(Math.random() * (denom - 1)) + 2; // 2 to denom
  const b = Math.floor(Math.random() * (a - 1)) + 1;     // 1 to a-1
  const correctNum = a - b;

  return {
    type: 'subtraction',
    a,
    b,
    denom,
    answerNum: correctNum,
    answerText: `${correctNum}/${denom}`,
    equationText: `${a}/${denom} - ${b}/${denom} = ?`,
    visualType: 'ribbon'
  };
}

// Generate distractors modeling common student mistakes
export function generateDistractors(problem) {
  const { a, b, denom, type, answerNum } = problem;
  const distractors = new Set();

  // Mistake 1: Add or subtract both numerators and denominators (e.g. 1/3 + 1/3 = 2/6)
  if (type === 'addition') {
    distractors.add(`${a + b}/${denom + denom}`);
  } else {
    distractors.add(`${a - b}/${denom - denom > 0 ? denom - denom : denom}`);
  }

  // Mistake 2: Denominator is added/subtracted, numerator is unchanged
  distractors.add(`${a}/${denom + denom}`);
  
  // Mistake 3: Off-by-one in numerator (keeping denominator same)
  if (answerNum > 1) {
    distractors.add(`${answerNum - 1}/${denom}`);
  }
  if (answerNum < denom) {
    distractors.add(`${answerNum + 1}/${denom}`);
  }

  // Fallback if we don't have enough unique options
  let safety = 1;
  while (distractors.size < 3) {
    const randomNum = Math.floor(Math.random() * (denom - 1)) + 1;
    if (randomNum !== answerNum) {
      distractors.add(`${randomNum}/${denom}`);
    }
    safety++;
    if (safety > 20) break;
  }

  // Return exactly 2 unique distractors as strings
  return [...distractors].filter(d => d !== problem.answerText).slice(0, 2);
}

// Generate full practice session of 10 questions
export function generatePracticeSession() {
  const session = [];

  // Generate 5 additions (3 equations, 2 word problems)
  for (let i = 0; i < 3; i++) {
    const prob = generateAdditionProblem();
    const options = [prob.answerText, ...generateDistractors(prob)].sort(() => Math.random() - 0.5);
    session.push({
      ...prob,
      id: `add-eq-${i}`,
      format: 'equation',
      options
    });
  }
  for (let i = 0; i < 2; i++) {
    const prob = generateAdditionProblem();
    const template = sample(WORD_PROBLEM_TEMPLATES.addition);
    const options = [prob.answerText, ...generateDistractors(prob)].sort(() => Math.random() - 0.5);
    session.push({
      ...prob,
      id: `add-wp-${i}`,
      format: 'word-problem',
      options,
      questionText: template.text(prob.a, prob.b, prob.denom),
      character: template.character,
      unit: template.unit
    });
  }

  // Generate 5 subtractions (3 equations, 2 word problems)
  for (let i = 0; i < 3; i++) {
    const prob = generateSubtractionProblem();
    const options = [prob.answerText, ...generateDistractors(prob)].sort(() => Math.random() - 0.5);
    session.push({
      ...prob,
      id: `sub-eq-${i}`,
      format: 'equation',
      options
    });
  }
  for (let i = 0; i < 2; i++) {
    const prob = generateSubtractionProblem();
    const template = sample(WORD_PROBLEM_TEMPLATES.subtraction);
    const options = [prob.answerText, ...generateDistractors(prob)].sort(() => Math.random() - 0.5);
    session.push({
      ...prob,
      id: `sub-wp-${i}`,
      format: 'word-problem',
      options,
      questionText: template.text(prob.a, prob.b, prob.denom),
      character: template.character,
      unit: template.unit
    });
  }

  // Shuffle all 10 questions using Fisher-Yates
  for (let i = session.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [session[i], session[j]] = [session[j], session[i]];
  }

  return session;
}
