export declare function parseGithubRepoFullName(text: string): string | null;
export declare function extractAppRepo(
  prBody: string | null | undefined,
  excludeRepo?: string | null
): string | null;
