export const NARRATION = {
  intro: {
    badge: "✨  ·  Grade 3 Math  ·  Fractions",
    title: "The Great Fraction Festival",
    subtitle: "Help the friends solve fraction puzzles to prepare for the big town celebration in Numberville!",
    mascotText: "Hi, I'm Leo! I will guide you through our fraction adventure today. Let's learn to add and subtract fractions that share the same denominator!",
    narrationText: "Welcome to Numberville! The annual Fraction Festival is about to begin, and your friends need your help. Are you ready to become a Fraction Hero? Let's get started!"
  },
  wonder: {
    question: "If we have a pizza cut into 8 equal slices, and we eat 2 slices in the morning and 3 slices in the afternoon... how much did we eat in total?",
    subQuestion: "Does the size of the slices change? Do we add the total slices in the pizza together?",
    mascotText: "Look at this pizza! If we add eighths together, does it become sixteenths? Think about it, and let's find out!",
    narrationText: "Let's wonder about this! John baked a delicious pizza cut into eight equal slices. He ate two eighths in the morning, and then three eighths in the afternoon. When we combine them, we get five slices. But wait... are they still eighths, or did the pizza suddenly get sliced into sixteenths? Let's check out the story to see how it works!"
  },
  story: [
    {
      image: "pizza",
      character: "John",
      characterRole: "Pizza Chef",
      text: "Hi there! I'm John, the festival pizza chef. I sliced my specialty pizza into 8 equal pieces. In the morning, I ate 2/8 of the pizza. In the afternoon, I ate 3/8 more. How much did I eat altogether?",
      highlight: '"Denominator represents slice sizes, which do not change!"',
      mascotText: "When adding like fractions, we only add the top numbers. The denominator stays the same!",
      narrationText: "John baked a pizza cut into 8 equal slices. He ate two eighths in the morning and three eighths in the afternoon. Since the size of the slices doesn't change, we just add the numerators. Two eighths plus three eighths equals five eighths!"
    },
    {
      image: "ribbon",
      character: "Sarah",
      characterRole: "Ribbon Decorator",
      text: "Hello! I'm Sarah. I'm decorating the festival gates with colorful ribbons. I have 5/6 of a ribbon left. If I use 2/6 of a ribbon to wrap this beautiful gift box, how much ribbon will be left?",
      highlight: '"Subtraction works the same way: keep the bottom, subtract the top!"',
      mascotText: "Five sixths minus two sixths is three sixths. We only subtract the numerators!",
      narrationText: "Sarah has five sixths of a ribbon. She cuts away two sixths to wrap a gift box. By subtracting the numerators, we find that five sixths minus two sixths equals three sixths. The denominator six stays the same!"
    },
    {
      image: "pie",
      character: "Mike",
      characterRole: "Pie Baker",
      text: "Oh no! I'm Mike, the pastry chef, and I mixed up my pie slices! I have some addition and subtraction cards that need matching to the correct pie layouts. Can you help me sort out my pans?",
      highlight: '"Look at the operator first (+ or -), then solve the numerator!"',
      mascotText: "Use the slider in the simulation to add or subtract slices and help Mike sort his pies!",
      narrationText: "Mike is confused about his berry pies. Let's help him sort them out! We will look at whether we need to add or subtract pie slices, and then use our fraction skills to find the answers."
    },
    {
      image: "arena",
      character: "Priya",
      characterRole: "Festival Organizer",
      text: "Amazing job! You have helped John, Sarah, and Mike. Now, the main festival gate is opening! I need your help to set up all the game stalls. Are you ready for some quick fraction challenges?",
      highlight: '"Earn XP, stars, and unlock badges for correct answers!"',
      mascotText: "Let's enter the Practice Arena! Solve 10 randomized challenges to help Priya set up the festival stalls.",
      narrationText: "Welcome to the Fraction Festival Practice Arena! Help Priya set up the stalls by solving ten randomized challenges. Good luck, future fraction hero!"
    }
  ],
  simulations: {
    pizza: {
      intro: "John's Pizza: Drag and select slices to add them together!",
      step1: "First, select 2 slices (2/8) for John's breakfast. Click or tap 2 empty slices to color them orange.",
      step2: "Nice! Now select 3 more slices (3/8) for John's afternoon snack. Click 3 empty slices to color them purple.",
      success: "Great work! 2 eighths plus 3 eighths is 5 eighths. You can see 5 shaded slices. The total slices in the pizza stays 8!",
      equation: "2/8 + 3/8 = 5/8"
    },
    ribbon: {
      intro: "Sarah's Ribbon: Click on the active segments to cut them away!",
      step1: "We start with 5 sixths (5/6) of the ribbon colored in blue. Click on 2 segments to 'snip' them away.",
      success: "Fabulous! You cut away 2 sixths. 5 sixths minus 2 sixths is 3 sixths. Look, 3 blue segments are left!",
      equation: "5/6 − 2/6 = 3/6"
    },
    pie: {
      intro: "Mike's Pie Mix-up: Help Mike solve the equation card!",
      problem: "Card: 3/5 + 1/5 = ?",
      step1: "First, click the plus (+) button to select addition.",
      step2: "Now drag the slider to 4 slices to represent the total 4/5 pie.",
      success: "Excellent! 3 fifths plus 1 fifth equals 4 fifths. Mike's pie is perfectly sorted!",
      equation: "3/5 + 1/5 = 4/5"
    }
  },
  celebration: {
    title: "Official Fraction Hero!",
    subtitle: "You saved the Fraction Festival! John, Sarah, Mike, and Priya are celebrating your math success.",
    mascotText: "Incredible job! You unlocked badges and proved that you understand how to add and subtract like fractions. Keep practicing!",
    narrationText: "Congratulations! You did it! The Fraction Festival is saved and you are now an official Fraction Hero of Numberville. John, Sarah, Mike, and Priya are so proud of you! See you on the next adventure!"
  }
};
