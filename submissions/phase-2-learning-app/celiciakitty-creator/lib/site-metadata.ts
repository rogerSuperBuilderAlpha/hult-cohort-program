/** Public site metadata — safe to import from server and client modules. */

export const siteConfig = {
  name: "LexLearn",
  tagline: "Learn. Understand. Apply.",
  title: "LexLearn | Beginner UK Law Learning Platform",
  description:
    "Explore civil law, criminal law and everyday legal rights with interactive lessons, real-life examples and quizzes for UK beginners. England and Wales focus.",
  keywords: [
    "UK law",
    "beginner law",
    "civil law",
    "criminal law",
    "everyday legal rights",
    "England and Wales",
    "legal education",
    "interactive learning",
    "LexLearn",
  ],
  author: "LexLearn",
  locale: "en_GB",
} as const;

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (value) {
    return value.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}
