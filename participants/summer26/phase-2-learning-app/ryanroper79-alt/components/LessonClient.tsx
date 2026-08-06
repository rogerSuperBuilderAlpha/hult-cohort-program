'use client';

import { useEffect, useState } from 'react';

type Quiz = {
  question: string;
  options: string[];
  correctIndex: number;
};

type Props = {
  lessonId: string;
  quiz: Quiz;
};

async function track(event: string, metadata?: Record<string, string>) {
  await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, metadata }),
  });
}

export function LessonClient({ lessonId, quiz }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    void track('lesson_started', { lesson_id: lessonId });
  }, [lessonId]);

  async function submitQuiz() {
    if (selected === null) return;
    const isCorrect = selected === quiz.correctIndex;
    setCorrect(isCorrect);
    setSubmitted(true);
    await track('quiz_submitted', {
      lesson_id: lessonId,
      correct: String(isCorrect),
    });
    if (isCorrect) {
      await track('lesson_completed', { lesson_id: lessonId });
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-leaf-500/15 bg-leaf-50/60 p-5">
      <h3 className="font-semibold text-leaf-900">Quick check</h3>
      <p className="mt-2 text-sm">{quiz.question}</p>
      <div className="mt-4 space-y-2">
        {quiz.options.map((option, index) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name={`quiz-${lessonId}`}
              checked={selected === index}
              onChange={() => setSelected(index)}
              disabled={submitted}
            />
            {option}
          </label>
        ))}
      </div>
      {!submitted ? (
        <button
          type="button"
          onClick={() => void submitQuiz()}
          disabled={selected === null}
          className="mt-4 rounded-lg bg-leaf-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Submit answer
        </button>
      ) : (
        <p className={`mt-4 text-sm font-medium ${correct ? 'text-leaf-700' : 'text-amber-800'}`}>
          {correct ? 'Correct — lesson completed and events recorded.' : 'Not quite — review the lesson and try again.'}
        </p>
      )}
    </div>
  );
}
