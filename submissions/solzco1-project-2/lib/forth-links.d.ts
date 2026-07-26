export function normalizePmBaseUrl(base?: string): string;
export function buildForthTaskDeepLink(taskId: string, baseUrl?: string): string;
export function parseForthTaskUrl(
  url: string,
  baseUrl?: string,
): { taskId: string } | null;
export function extractForthLinks(
  text: string,
  baseUrl?: string,
): Array<{ url: string; taskId: string }>;
export function mentionPattern(): RegExp;
export function findMentionHandles(text: string): string[];
