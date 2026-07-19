import { AppShell } from "@/components/AppShell";
import { computeCivilizationIndex, computeCohortMetrics } from "@/lib/civilization";
import { getCurrentProfile, loadCohortData } from "@/lib/data";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const me = await getCurrentProfile();
  const data = await loadCohortData();
  const metrics = computeCohortMetrics(data);
  const civilizationIndex = computeCivilizationIndex(metrics);

  if (!me) {
    return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>;
  }

  return (
    <AppShell
      userId={me.id}
      displayName={me.display_name}
      githubUsername={me.github_username}
      civilizationIndex={civilizationIndex}
    >
      {children}
    </AppShell>
  );
}
