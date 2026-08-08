"use client";

import { useEffect, useState } from "react";

export default function LearningClient({ profile, lessons, quizzes }) {
  const [completed, setCompleted] = useState({});
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [balance, setBalance] = useState(null);
  const [question, setQuestion] = useState("");
  const [tutorReply, setTutorReply] = useState("");
  const [tutorError, setTutorError] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    fetch("/api/credits")
      .then((response) => (response.ok ? response.json() : null))
      .then(setBalance)
      .catch(() => setBalance(null));
  }, []);

  async function askTutor() {
    if (!question.trim()) return;
    setAsking(true);
    setTutorError("");
    setTutorReply("");
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
      });
      const body = await response.json();
      if (!response.ok) {
        setTutorError(body.error || "The tutor is unavailable.");
        return;
      }
      setTutorReply(body.text);
      if (body.credits?.newBalanceCents !== undefined) {
        setBalance((current) => current ? { ...current, spendableCents: body.credits.newBalanceCents, spendableFormatted: `$${(body.credits.newBalanceCents / 100).toFixed(2)}` } : current);
      }
    } catch {
      setTutorError("The tutor is unavailable. Please try again.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="learn-header">
        <div><p className="eyebrow">PyByte</p><h1>Python, one byte at a time.</h1></div>
        <p className="profile">Signed in as <strong>{profile.email}</strong></p>
      </header>
      <section className="tutor-panel" aria-labelledby="tutor-title">
        <div>
          <p className="eyebrow">Ludwitt AI tutor</p>
          <h2 id="tutor-title">Stuck on a Python idea?</h2>
          <p>Ask for a concise explanation or example. AI replies use your paid Ludwitt credit balance.</p>
        </div>
        <p className="balance">{balance ? `Spendable credits: ${balance.spendableFormatted}` : "Checking spendable credits…"}</p>
        <label className="sr-only" htmlFor="tutor-question">Ask the tutor</label>
        <textarea id="tutor-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength="1200" placeholder="Why does a Python list start at index 0?" />
        <button disabled={asking || !question.trim()} onClick={askTutor}>{asking ? "Asking…" : "Ask PyByte"}</button>
        {tutorError && <p className="error" role="alert">{tutorError} {tutorError.includes("credits") && <a href="https://pitchrise.ludwitt.com/account/credits">Top up credits</a>}</p>}
        {tutorReply && <div className="tutor-reply"><strong>PyByte says</strong><p>{tutorReply}</p></div>}
      </section>
      <p className="intro">Six focused lessons. Each one takes about five minutes.</p>
      <section className="lesson-grid" aria-label="Python lessons">
        {lessons.map((lesson, index) => {
          const quiz = quizzes.find((item) => item.lessonId === lesson.id);
          return (
            <article className="lesson-card" key={lesson.id}>
              <div className="card-topline"><span>Lesson {String(index + 1).padStart(2, "0")}</span><span>{lesson.minutes} min</span></div>
              <h2>{lesson.title}</h2><p>{lesson.summary}</p><pre><code>{lesson.example}</code></pre>
              <button disabled={completed[lesson.id]} onClick={() => setCompleted((current) => ({ ...current, [lesson.id]: true }))}>{completed[lesson.id] ? "Lesson complete" : "Mark lesson complete"}</button>
              <div className="quiz"><p className="quiz-label">Quick check</p><h3>{quiz.question}</h3>
                <div className="options">{quiz.options.map((option) => <label key={option}><input type="radio" name={quiz.id} value={option} checked={answers[quiz.id] === option} onChange={() => setAnswers((current) => ({ ...current, [quiz.id]: option }))} disabled={submitted[quiz.id]} />{option}</label>)}</div>
                <button className="secondary" disabled={!answers[quiz.id] || submitted[quiz.id]} onClick={() => setSubmitted((current) => ({ ...current, [quiz.id]: true }))}>{submitted[quiz.id] ? "Answer submitted" : "Submit answer"}</button>
                {submitted[quiz.id] && <p className="status">{answers[quiz.id] === quiz.answer ? "Correct — nice work." : `Keep going — the answer is “${quiz.answer}”.`}</p>}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
