'use client';

import { useEffect, useState } from 'react';
import type { RfpCase } from '@/lib/rfp-cases';

type Quiz = RfpCase['quiz'];

type Props = {
  caseId: string;
  outcome: RfpCase['outcome'];
  quiz: Quiz;
};

async function track(event: string, metadata?: Record<string, string>) {
  await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, metadata }),
  });
}

export function RfpCaseClient({ caseId, outcome, quiz }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);

  useEffect(() => {
    void track('lesson_started', { rfp_case_id: caseId, outcome });
  }, [caseId, outcome]);

  async function submitQuiz() {
    if (selected === null) return;
    const isCorrect = selected === quiz.correctIndex;
    setCorrect(isCorrect);
    setSubmitted(true);
    await track('quiz_submitted', {
      rfp_case_id: caseId,
      outcome,
      correct: String(isCorrect),
    });
    if (isCorrect) {
      await track('lesson_completed', { rfp_case_id: caseId, outcome });
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-ceal-500/15 bg-ceal-50/60 p-5">
      <h3 className="font-semibold text-ceal-900">Learning check — apply this case to future RFPs</h3>
      <p className="mt-2 text-sm">{quiz.question}</p>
      <div className="mt-4 space-y-2">
        {quiz.options.map((option, index) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name={`quiz-${caseId}`}
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
          className="mt-4 rounded-lg bg-ceal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Submit answer
        </button>
      ) : (
        <p className={`mt-4 text-sm font-medium ${correct ? 'text-ceal-700' : 'text-amber-800'}`}>
          {correct
            ? 'Correct — case logged for agent training. Events recorded.'
            : 'Review the win/loss analysis above and try again.'}
        </p>
      )}
    </div>
  );
}
