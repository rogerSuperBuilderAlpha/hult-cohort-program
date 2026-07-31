/**
 * Feasibility studies — verified project types only.
 * Financial figures (payback, IRR, costs) live in the full report; not published on-site.
 */

export type FeasibilityProject = {
  id: string;
  title: string;
  summary: string;
  region: string;
};

export const feasibilityProjects: FeasibilityProject[] = [
  {
    id: 'wave-energy',
    title: 'Wave energy solutions',
    summary:
      'Feasibility for island-scale wave energy — resource assessment, generation profile, and grid integration for Caribbean contexts.',
    region: 'Caribbean islands',
  },
  {
    id: 'solar-farms',
    title: 'Solar farms',
    summary:
      'Feasibility for utility-scale solar on Caribbean islands — land use, interconnection, and bankable generation economics.',
    region: 'Caribbean islands',
  },
  {
    id: 'modular-homes',
    title: 'Modular homes',
    summary:
      'Feasibility for fast-construction modular housing — factory-to-site delivery, schedule compression, and regional build cost structure.',
    region: 'Caribbean islands',
  },
];

/** Contents of the full report delivered on request — not fabricated metrics. */
export const feasibilityReportContents = [
  'Payback period',
  'Rates of return',
  'Project management — scope, schedule, and cost of construction',
  'Investment required',
  'Investor cohort — co-investors aligned to deliver the project and return capital',
] as const;

export function reportRequestMailto(project: FeasibilityProject, contactEmail: string): string {
  const subject = encodeURIComponent(`Feasibility report request — ${project.title}`);
  const body = encodeURIComponent(
    [
      `Project: ${project.title}`,
      `Region: ${project.region}`,
      '',
      'Please send the full feasibility report including payback period, rates of return, project management details, investment required, and investor cohort structure.',
      '',
      'Name / organisation:',
      'Contact:',
    ].join('\n')
  );

  return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
}
