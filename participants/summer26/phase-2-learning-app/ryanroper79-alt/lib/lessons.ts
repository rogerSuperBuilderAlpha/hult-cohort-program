export type Lesson = {
  id: string;
  title: string;
  summary: string;
  body: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
  };
};

export const lessons: Lesson[] = [
  {
    id: 'carbon-basics',
    title: 'Carbon basics for builders',
    summary: 'Understand scope 1–3 emissions and why product teams track them.',
    body: [
      'Scope 1 emissions come from sources you own — fleet vehicles, on-site fuel combustion.',
      'Scope 2 covers purchased electricity, steam, heating, and cooling.',
      'Scope 3 includes supply chain, business travel, and product use — often the largest share.',
      'Learning apps like this one help teams build a shared vocabulary before shipping climate features.',
    ],
    quiz: {
      question: 'Which scope typically includes supply-chain emissions?',
      options: ['Scope 1', 'Scope 2', 'Scope 3', 'Scope 0'],
      correctIndex: 2,
    },
  },
  {
    id: 'green-software',
    title: 'Green software patterns',
    summary: 'Reduce compute waste without sacrificing user experience.',
    body: [
      'Right-size cloud instances and use autoscaling instead of peak provisioning.',
      'Cache aggressively at the edge to cut repeated database reads.',
      'Batch background jobs and prefer async processing for non-urgent work.',
      'Measure energy per request — small wins compound at cohort scale.',
    ],
    quiz: {
      question: 'What is the fastest win for most web apps?',
      options: [
        'Rewrite in assembly',
        'Edge caching and right-sized compute',
        'Delete all logs',
        'Run only on Fridays',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'climate-comms',
    title: 'Communicating climate impact',
    summary: 'Write credible impact statements for users and stakeholders.',
    body: [
      'Lead with measurable outcomes, not vague “eco-friendly” claims.',
      'Cite methodology and time boundaries (e.g. kg CO₂e avoided per year).',
      'Acknowledge uncertainty — ranges beat false precision.',
      'Tie learning progress to action: what should the user do next?',
    ],
    quiz: {
      question: 'Which claim is most credible for a product page?',
      options: [
        '100% carbon neutral forever',
        'Estimated 12–18 kg CO₂e avoided per user/year (methodology linked)',
        'Greenest app on Earth',
        'No emissions ever',
      ],
      correctIndex: 1,
    },
  },
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}
