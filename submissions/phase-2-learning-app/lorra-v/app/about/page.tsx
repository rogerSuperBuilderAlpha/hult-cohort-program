import Link from "next/link";

export default function AboutPage() {
  return (
    <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "3rem 1.5rem" }}>
      <p style={{ marginBottom: "1.5rem" }}>
        <Link href="/">← Home</Link>
      </p>
      <h1>About</h1>
      <p style={{ marginTop: "1.5rem", lineHeight: 1.7 }}>
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
    </main>
  );
}
