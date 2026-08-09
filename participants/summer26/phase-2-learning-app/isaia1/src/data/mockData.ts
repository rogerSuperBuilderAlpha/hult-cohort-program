import { Course } from '../types';

export const courses: Course[] = [
  {
    id: 'math-algebra',
    title: 'Algebra Fundamentals',
    description: 'Master the basics of algebra — equations, variables, and problem solving.',
    subject: 'math',
    icon: 'calculator-outline',
    color: '#6366F1',
    totalLessons: 5,
    lessons: [
      {
        id: 'math-algebra-l1',
        title: 'Introduction to Variables',
        duration: 12,
        content:
          'Variables are symbols (usually letters like x, y, or n) that represent unknown values in mathematical expressions.\n\nFor example, in the equation x + 5 = 12, x is the variable we need to solve for.\n\nKey concepts:\n• A variable can hold different values\n• We use variables to write general rules\n• Solving means finding the value that makes the equation true',
      },
      {
        id: 'math-algebra-l2',
        title: 'Solving Linear Equations',
        duration: 15,
        content:
          'A linear equation has the form ax + b = c, where a, b, and c are constants.\n\nSteps to solve:\n1. Simplify both sides\n2. Move variable terms to one side\n3. Move constants to the other side\n4. Divide by the coefficient\n\nExample: 2x + 3 = 11\n→ 2x = 8\n→ x = 4',
      },
      {
        id: 'math-algebra-l3',
        title: 'Working with Inequalities',
        duration: 10,
        content:
          'Inequalities use <, >, ≤, or ≥ instead of =.\n\nImportant rule: When you multiply or divide both sides by a negative number, flip the inequality sign.\n\nExample: -2x > 6\n→ x < -3',
      },
    ],
    quizzes: [
      {
        id: 'math-algebra-q1',
        question: 'What is the value of x in: x + 7 = 15?',
        options: ['6', '7', '8', '9'],
        correctIndex: 2,
        explanation: 'Subtract 7 from both sides: x = 15 - 7 = 8',
      },
      {
        id: 'math-algebra-q2',
        question: 'Solve: 3x - 4 = 11',
        options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
        correctIndex: 2,
        explanation: 'Add 4 to both sides: 3x = 15, then divide by 3: x = 5',
      },
      {
        id: 'math-algebra-q3',
        question: 'Which symbol represents "greater than or equal to"?',
        options: ['>', '<', '≥', '≠'],
        correctIndex: 2,
        explanation: '≥ means greater than or equal to',
      },
    ],
    flashcards: [
      { id: 'math-algebra-f1', front: 'Variable', back: 'A symbol representing an unknown value' },
      { id: 'math-algebra-f2', front: 'Coefficient', back: 'The number multiplied by a variable (e.g., 3 in 3x)' },
      { id: 'math-algebra-f3', front: 'Linear Equation', back: 'An equation where the highest power of the variable is 1' },
    ],
  },
  {
    id: 'science-physics',
    title: 'Physics Basics',
    description: 'Explore motion, forces, energy, and the laws that govern our universe.',
    subject: 'science',
    icon: 'flask-outline',
    color: '#10B981',
    totalLessons: 4,
    lessons: [
      {
        id: 'science-physics-l1',
        title: 'Newton\'s First Law',
        duration: 14,
        content:
          'An object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by an unbalanced force.\n\nThis is also called the Law of Inertia.\n\nReal-world example: When a car brakes suddenly, passengers lurch forward because their bodies want to keep moving.',
      },
      {
        id: 'science-physics-l2',
        title: 'Force and Acceleration',
        duration: 16,
        content:
          'Newton\'s Second Law: F = ma\n\nForce equals mass times acceleration.\n\n• More force → more acceleration\n• More mass → less acceleration for the same force\n\nUnit of force: Newton (N)',
      },
    ],
    quizzes: [
      {
        id: 'science-physics-q1',
        question: 'What is Newton\'s First Law also known as?',
        options: ['Law of Gravity', 'Law of Inertia', 'Law of Action-Reaction', 'Law of Energy'],
        correctIndex: 1,
        explanation: 'Newton\'s First Law is the Law of Inertia',
      },
      {
        id: 'science-physics-q2',
        question: 'F = ma represents which law?',
        options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravity'],
        correctIndex: 1,
        explanation: 'F = ma is Newton\'s Second Law',
      },
    ],
    flashcards: [
      { id: 'science-physics-f1', front: 'Inertia', back: 'The tendency of an object to resist changes in motion' },
      { id: 'science-physics-f2', front: 'F = ma', back: 'Force equals mass times acceleration' },
      { id: 'science-physics-f3', front: 'Newton (N)', back: 'The SI unit of force' },
    ],
  },
  {
    id: 'coding-basics',
    title: 'Intro to Programming',
    description: 'Learn programming fundamentals with JavaScript — variables, loops, and functions.',
    subject: 'coding',
    icon: 'code-slash',
    color: '#8B5CF6',
    totalLessons: 6,
    lessons: [
      {
        id: 'coding-basics-l1',
        title: 'What is Programming?',
        duration: 10,
        content:
          'Programming is giving instructions to a computer to perform tasks.\n\nPrograms are written in programming languages like JavaScript, Python, or Java.\n\nKey concepts:\n• Code is read top to bottom\n• Computers follow instructions exactly\n• Bugs are mistakes in code',
      },
      {
        id: 'coding-basics-l2',
        title: 'Variables and Data Types',
        duration: 18,
        content:
          'Variables store data values.\n\nIn JavaScript:\nlet name = "Alice";    // string\nlet age = 25;           // number\nlet isStudent = true;   // boolean\n\nUse const for values that won\'t change, let for values that will.',
      },
    ],
    quizzes: [
      {
        id: 'coding-basics-q1',
        question: 'Which keyword declares a variable that can be reassigned?',
        options: ['const', 'let', 'var only', 'static'],
        correctIndex: 1,
        explanation: 'let declares a variable that can be reassigned',
      },
      {
        id: 'coding-basics-q2',
        question: 'What data type is true?',
        options: ['string', 'number', 'boolean', 'object'],
        correctIndex: 2,
        explanation: 'true and false are boolean values',
      },
    ],
    flashcards: [
      { id: 'coding-basics-f1', front: 'Variable', back: 'A named container for storing data' },
      { id: 'coding-basics-f2', front: 'Boolean', back: 'A data type with only true or false values' },
      { id: 'coding-basics-f3', front: 'Function', back: 'A reusable block of code that performs a task' },
    ],
  },
  {
    id: 'history-world',
    title: 'World History',
    description: 'Journey through major civilizations, wars, and turning points in human history.',
    subject: 'history',
    icon: 'globe-outline',
    color: '#F59E0B',
    totalLessons: 5,
    lessons: [
      {
        id: 'history-world-l1',
        title: 'The Renaissance',
        duration: 20,
        content:
          'The Renaissance (14th–17th century) was a period of cultural rebirth in Europe.\n\nKey features:\n• Revival of classical Greek and Roman art\n• Humanism — focus on human potential\n• Major artists: Leonardo da Vinci, Michelangelo\n• Printing press spread knowledge rapidly',
      },
    ],
    quizzes: [
      {
        id: 'history-world-q1',
        question: 'When did the Renaissance primarily occur?',
        options: ['5th–8th century', '14th–17th century', '18th–19th century', '20th century'],
        correctIndex: 1,
        explanation: 'The Renaissance flourished from the 14th to 17th century',
      },
    ],
    flashcards: [
      { id: 'history-world-f1', front: 'Renaissance', back: 'A period of cultural rebirth in Europe (14th–17th c.)' },
      { id: 'history-world-f2', front: 'Humanism', back: 'Philosophy emphasizing human potential and achievement' },
    ],
  },
];
