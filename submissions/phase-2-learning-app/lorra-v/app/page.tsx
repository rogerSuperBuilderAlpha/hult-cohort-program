import Link from "next/link";

const PATHS = [
  {
    title: "Regarding Others",
    subtitle: "Authority, participation and ownership",
    modules: "Detachment · Focus · Engagement",
  },
  {
    title: "Regarding Myself",
    subtitle: "Agency, imagination and intention",
    modules: "Interior Dialogue · Sense of Wonder · Intentionality",
  },
  {
    title: "Regarding Life",
    subtitle: "Perception, uncertainty and intervention",
    modules: "Awareness · Presence · Action",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #c5d9d4",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <strong style={{ fontFamily: "var(--font-source-serif), Georgia, serif" }}>
          The Effective Facilitator
        </strong>
        <Link href="/launch" className="tef-btn" style={{ textDecoration: "none" }}>
          Launch from Ludwitt/Hult
        </Link>
      </header>

      <main style={{ maxWidth: "42rem", margin: "0 auto", padding: "4rem 1.5rem 3rem" }}>
        <p
          style={{
            color: "var(--tef-sage)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "0.8rem",
            marginBottom: "1rem",
          }}
        >
          Nine disciplines for human judgment in the age of AI
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", margin: "0 0 1.25rem" }}>
          The Effective Facilitator
        </h1>
        <p style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
          AI makes generation abundant. Human judgment becomes the constraint.
        </p>
        <p style={{ color: "var(--tef-muted)", marginBottom: "2.5rem" }}>
          A developmental learning programme that strengthens the judgment,
          self-awareness and human agency required to navigate authority,
          ambiguity and control — without surrendering to the machine.
        </p>
        <p style={{ marginBottom: "3rem" }}>
          <em>Facilitation begins with the facilitation of self.</em>
        </p>

        <h2 style={{ fontSize: "1.35rem", marginBottom: "1.25rem" }}>
          Three paths
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {PATHS.map((path) => (
            <li
              key={path.title}
              style={{
                marginBottom: "1.5rem",
                paddingBottom: "1.5rem",
                borderBottom: "1px solid #c5d9d4",
              }}
            >
              <strong style={{ display: "block", fontSize: "1.1rem" }}>
                {path.title}
              </strong>
              <span style={{ color: "var(--tef-muted)" }}>{path.subtitle}</span>
              <div style={{ marginTop: "0.35rem", color: "var(--tef-sage)", fontSize: "0.95rem" }}>
                {path.modules}
              </div>
            </li>
          ))}
        </ul>

        <p style={{ marginTop: "2.5rem", color: "var(--tef-muted)" }}>
          There is no public sign-up. Enter through the Ludwitt/Hult launcher.
        </p>
      </main>

      <footer
        style={{
          borderTop: "1px solid #c5d9d4",
          padding: "2rem 1.5rem 3rem",
          maxWidth: "42rem",
          margin: "0 auto",
          color: "var(--tef-muted)",
          fontSize: "0.9rem",
        }}
      >
        <p style={{ marginBottom: "0.75rem" }}>
          <Link href="/about">About & attribution</Link>
        </p>
        <p style={{ margin: 0 }}>
          The Effective Facilitator is inspired by and adapted from{" "}
          <em>
            The 9 Disciplines of a Facilitator: Leading Groups by Transforming
            Yourself
          </em>{" "}
          by Jon C. Jenkins and Maureen R. Jenkins. The original framework was
          developed for facilitators leading groups. This programme extends the
          disciplines into the context of self-facilitation, human judgment and
          responsible decision-making in the age of artificial intelligence.
        </p>
      </footer>
    </div>
  );
}
