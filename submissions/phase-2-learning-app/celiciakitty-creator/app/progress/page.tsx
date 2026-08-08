import type { Metadata } from "next";

import { ProgressPageContent } from "@/components/learn/progress-page-content";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Progress | LexLearn",
  description: "Track your progress through Beginner UK Law modules.",
};

export default function ProgressPage() {
  return (
    <PageShell>
      <ProgressPageContent />
    </PageShell>
  );
}
