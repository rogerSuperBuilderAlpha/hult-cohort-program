/** GitHub org repo search filtered by project prefix (peer submission repos). */
export function orgReposSearchUrl(org: string, projectSlug: string): string {
  const prefix: Record<string, string> = {
    onboarding: 'roster',
    'phase-1-project-1': 'pm-',
    'phase-1-project-2': 'comms-',
    'phase-1-project-3': 'showcase-',
    'phase-1-unification': 'ecosystem',
    'phase-2-learning-app': 'learning-',
    'phase-2-venture': 'venture-',
    'phase-2-open-source': 'oss-',
  };
  const q = prefix[projectSlug] ?? '';
  const base = `https://github.com/orgs/${org}/repositories`;
  return q ? `${base}?q=${encodeURIComponent(q)}` : base;
}

export function githubRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}
