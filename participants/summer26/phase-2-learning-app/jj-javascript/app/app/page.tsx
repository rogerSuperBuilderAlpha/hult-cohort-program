import Link from 'next/link';
import { readSession } from '@/lib/ludwitt/session';
import { CHALLENGE_LIST } from '@/lib/shell/engine';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; launched?: string }>;
}) {
  const session = await readSession();
  const params = await searchParams;

  return (
    <main className="page hero">
      <h1>Git Arcade</h1>
      <p>
        Learn Git and terminal basics through timed challenges. You are graded on the final
        repository state, not the exact commands you typed.
      </p>

      {params.error ? (
        <div className="banner error">Launch failed: {params.error}. Enter via Ludwitt or demo launch.</div>
      ) : null}
      {params.launched ? <div className="banner">Session started. Good luck.</div> : null}

      <div className="actions">
        {session ? null : (
          <form action="/api/demo-launch" method="post">
            <button className="btn primary" type="submit">
              Demo launch
            </button>
          </form>
        )}
      </div>

      {session ? (
        <>
          <p style={{ marginTop: '1.5rem' }}>
            Signed in as <strong>{session.email}</strong>
          </p>
          <ul className="challenge-list">
            {CHALLENGE_LIST.map((c) => (
              <li key={c.id}>
                <Link className="btn" href={`/challenge/${c.id}`}>
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ marginTop: '1.5rem', opacity: 0.85 }}>
          Production users arrive with a Ludwitt launch token on <code>/launch?token=…</code>.
        </p>
      )}
    </main>
  );
}
