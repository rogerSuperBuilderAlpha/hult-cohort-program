import { useState } from 'react';
import { LUDWITT_TOP_UP_URL } from '../lib/ludwitt/pkce';
import { askAiTutor, type AiMessageResponse } from '../services/ludwittApi';
import { useAuth } from '../context/AuthContext';

interface AiTutorPanelProps {
  courseTitle: string;
  lessonTitle: string;
}

function extractAnswer(data: AiMessageResponse): string {
  const block = data.content?.find((item) => item.type === 'text');
  return block?.text ?? 'No response received.';
}

export default function AiTutorPanel({ courseTitle, lessonTitle }: AiTutorPanelProps) {
  const { isLudwittUser } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isLudwittUser) return null;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const data = await askAiTutor(question.trim(), { courseTitle, lessonTitle });

      if (data.code === 'INSUFFICIENT_PAID_CREDITS' || data.error === 'insufficient_paid_credits') {
        setError(
          "You're out of Ludwitt credits for third-party apps — top up at pitchrise.ludwitt.com/account/credits",
        );
        return;
      }

      if (data.error) {
        setError(data.error_description ?? data.error);
        return;
      }

      setAnswer(extractAnswer(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI tutor request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="glass fade-in" style={{ marginTop: 32, padding: 20, borderRadius: 16 }}>
      <h2 className="h3" style={{ marginBottom: 8 }}>AI Tutor</h2>
      <p className="subtitle" style={{ marginBottom: 16 }}>
        Ask a question about this lesson. Answers are powered by your Ludwitt credits.
      </p>

      <form onSubmit={handleAsk}>
        <textarea
          className="form-input"
          rows={3}
          placeholder="What part of this lesson would you like help with?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ resize: 'vertical', minHeight: 88 }}
        />
        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Thinking…' : 'Ask AI Tutor'}
        </button>
      </form>

      {error && (
        <div className="banner-error" style={{ marginTop: 16 }}>
          {error}
          {error.includes('top up') && (
            <div style={{ marginTop: 8 }}>
              <a href={LUDWITT_TOP_UP_URL} className="btn-link" target="_blank" rel="noreferrer">
                Top up credits
              </a>
            </div>
          )}
        </div>
      )}

      {answer && (
        <div
          className="fade-in"
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {answer}
        </div>
      )}
    </section>
  );
}
