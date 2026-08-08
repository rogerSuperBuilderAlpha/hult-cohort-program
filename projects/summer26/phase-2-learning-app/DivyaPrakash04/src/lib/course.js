export const lessons = [
  {
    id: "python-variables",
    title: "Name values with variables",
    minutes: 5,
    summary: "Variables give a useful name to a value so you can reuse it.",
    example: 'learner = "Ada"\nstreak_days = 3\nprint(learner, streak_days)',
  },
  {
    id: "python-strings",
    title: "Shape text with strings",
    minutes: 5,
    summary: "Strings hold text, and f-strings let you insert values into it.",
    example: 'name = "Mina"\nprint(f"Welcome, {name}!")',
  },
  {
    id: "python-lists",
    title: "Collect values in lists",
    minutes: 5,
    summary: "Lists keep ordered values together and use zero-based positions.",
    example: 'topics = ["variables", "strings", "lists"]\nprint(topics[0])',
  },
  {
    id: "python-conditionals",
    title: "Choose with conditionals",
    minutes: 5,
    summary: "An if statement runs code only when its condition is true.",
    example: 'score = 8\nif score >= 7:\n    print("Passed")',
  },
  {
    id: "python-loops",
    title: "Repeat with loops",
    minutes: 5,
    summary: "For loops repeat an action for every item in a collection.",
    example: 'for language in ["Python", "JavaScript"]:\n    print(language)',
  },
  {
    id: "python-functions",
    title: "Package work in functions",
    minutes: 5,
    summary: "Functions group reusable instructions behind a clear name.",
    example: 'def greet(name):\n    return f"Hi, {name}!"\n\nprint(greet("Sam"))',
  },
];

export const quizzes = [
  {
    id: "quiz-variables",
    lessonId: "python-variables",
    question: "Which line assigns the number 5 to a variable named score?",
    options: ["score == 5", "score = 5", "5 = score"],
    answer: "score = 5",
  },
  {
    id: "quiz-strings",
    lessonId: "python-strings",
    question: "What does an f-string help you do?",
    options: ["Insert values into text", "Create a loop", "Import a package"],
    answer: "Insert values into text",
  },
  {
    id: "quiz-lists",
    lessonId: "python-lists",
    question: "What is the first index in a Python list?",
    options: ["0", "1", "-1"],
    answer: "0",
  },
  {
    id: "quiz-conditionals",
    lessonId: "python-conditionals",
    question: "Which keyword starts a conditional branch in Python?",
    options: ["when", "if", "then"],
    answer: "if",
  },
  {
    id: "quiz-loops",
    lessonId: "python-loops",
    question: "What does a for loop do?",
    options: ["Repeats work over items", "Stores a secret", "Ends a program"],
    answer: "Repeats work over items",
  },
  {
    id: "quiz-functions",
    lessonId: "python-functions",
    question: "Which keyword defines a Python function?",
    options: ["function", "def", "define"],
    answer: "def",
  },
];

export function isValidTargetId(targetId) {
  return [...lessons, ...quizzes].some((item) => item.id === targetId);
}
