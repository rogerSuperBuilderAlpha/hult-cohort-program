import type { Metadata } from "next";

import { LearnPageContent } from "@/components/learn/learn-page-content";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Learn | LexLearn",
  description:
    "Browse Beginner UK Law modules across civil, criminal and everyday topics and start your next lesson.",
};

export default function LearnPage() {
  return (
    <PageShell>
      <LearnPageContent />
    </PageShell>
  );
}
