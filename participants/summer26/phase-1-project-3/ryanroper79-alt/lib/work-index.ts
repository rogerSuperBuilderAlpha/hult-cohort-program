import { participants, type Participant } from '@/data/participants';

export type WorkEntry = {
  handle: string;
  name: string;
  status: Participant['status'];
  week: 1 | 2 | 3;
  title: string;
  summary: string;
  liveUrl?: string;
  prUrl?: string;
};

export function allWorkEntries(): WorkEntry[] {
  const entries: WorkEntry[] = [];
  for (const p of participants) {
    for (const project of p.projects) {
      entries.push({
        handle: p.handle,
        name: p.name,
        status: p.status,
        week: project.week,
        title: project.title,
        summary: project.summary,
        liveUrl: project.liveUrl,
        prUrl: project.prUrl,
      });
    }
  }
  return entries.sort((a, b) => a.week - b.week);
}
