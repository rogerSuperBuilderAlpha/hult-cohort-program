/** Shape stored in progress.scenario_response (JSON text). */

export type ProgressAnswers = {
  contentViewed?: boolean;
  /** scenario_id → selected option key */
  answers?: Record<string, string>;
};

export function parseProgressAnswers(raw: string | null | undefined): ProgressAnswers {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ProgressAnswers;
    if (parsed && typeof parsed === "object") {
      return {
        contentViewed: Boolean(parsed.contentViewed),
        answers:
          parsed.answers && typeof parsed.answers === "object"
            ? parsed.answers
            : {},
      };
    }
  } catch {
    // Legacy free-text responses from Phase A placeholder — ignore.
  }
  return {};
}

export function serializeProgressAnswers(data: ProgressAnswers): string {
  return JSON.stringify({
    contentViewed: Boolean(data.contentViewed),
    answers: data.answers ?? {},
  });
}
