export default function HomePage() {
  return (
    <main className="landing-shell">
      <section className="hero" aria-labelledby="pybyte-title">
        <p className="eyebrow">PyByte · Python micro-learning</p>
        <h1 id="pybyte-title">Learn Python in five focused minutes a day.</h1>
        <p className="hero-copy">
          Build a practical Python habit with six short lessons on variables,
          strings, lists, conditionals, loops, and functions.
        </p>
        <div className="notice">
          <strong>Continue with Ludwitt.</strong>
          <span>
            Sign in securely with your Ludwitt account to save a private,
            encrypted session and access the AI tutor with your paid credits.
          </span>
        </div>
        <a className="button-link" href="/api/auth/signin">Sign in with Ludwitt</a>
      </section>
      <section className="feature-grid" aria-label="What you will learn">
        <article><span>01</span><h2>Understand</h2><p>Read a tiny, useful Python concept.</p></article>
        <article><span>02</span><h2>Practice</h2><p>Check your understanding with one question.</p></article>
        <article><span>03</span><h2>Repeat</h2><p>Come back tomorrow for another small win.</p></article>
      </section>
    </main>
  );
}
