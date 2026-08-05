import { JOB_TRACKS, roundPath, type InterviewRound, ROUNDS } from "@/lib/lessons";

/** Compact catalog for prompts — keeps tokens small */
export function catalogForPrompt(): string {
  return JOB_TRACKS.map((t) => {
    const lines = t.scenarios
      .map((s) => `  - ${s.slug} [${s.stage}] ${s.title} → /practice/${t.slug}/${s.slug}`)
      .join("\n");
    return `## ${t.role} (track: ${t.slug})\nSetting: ${t.setting}\n${t.blurb}\n${lines}`;
  }).join("\n\n");
}

export const COACH_SYSTEM = `You are Interview Room Coach — a concise interview prep assistant inside a learning app.

Your job:
1. Learn the user's target role, seniority, company type, and what they struggle with.
2. Personalize practice: recommend 2–4 specific scenarios from the catalog below (always include the full /practice/... path).
3. Help them rehearse answers with STAR (Situation, Task, Action, Result) or role-appropriate structure.
4. Ask one focused follow-up at a time when you need more context.
5. Stay warm, practical, and present-tense. No fake companies, fake metrics, or invented credentials.

Rules:
- Only recommend paths that exist in the catalog.
- Keep replies under ~180 words unless they ask for a full sample answer.
- If they want a mock interview, play the interviewer briefly, then coach the answer.
- Never claim you can guarantee a job offer.

CATALOG:
${catalogForPrompt()}`;

export type ChatMessage = { role: "user" | "assistant"; content: string };

function scoreRound(round: InterviewRound, text: string): number {
  const hay = `${round.role} ${round.setting} ${round.stage} ${round.title} ${round.summary} ${round.scenario}`.toLowerCase();
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9+/#]+/)
    .filter((w) => w.length > 2);
  let score = 0;
  for (const w of words) {
    if (hay.includes(w)) score += 1;
  }
  // Role boosts
  const roleHints: Record<string, string[]> = {
    "software-engineer": ["engineer", "swe", "backend", "frontend", "coding", "developer", "api"],
    "product-manager": ["pm", "product", "roadmap", "stakeholder"],
    "data-analyst": ["analyst", "sql", "data", "metrics", "experiment"],
    marketing: ["marketing", "growth", "campaign", "brand", "ads"],
    "customer-success": ["cs", "csm", "customer", "retention", "churn", "renewal"],
    "ux-designer": ["ux", "design", "figma", "research", "prototype"],
    "account-executive": ["sales", "ae", "quota", "pipeline", "enterprise"],
    "devops-sre": ["devops", "sre", "infra", "kubernetes", "oncall", "reliability"],
    "people-ops": ["hr", "people", "recruiting", "hiring", "talent"],
    operations: ["operations", "ops", "logistics", "fulfillment", "vendor"],
  };
  for (const [slug, hints] of Object.entries(roleHints)) {
    if (round.trackSlug === slug && hints.some((h) => text.toLowerCase().includes(h))) {
      score += 4;
    }
  }
  return score;
}

/** Offline personalization when no LLM API key is configured */
export function localCoachReply(history: ChatMessage[]): string {
  const userTurns = history.filter((m) => m.role === "user").map((m) => m.content);
  const last = userTurns[userTurns.length - 1] ?? "";
  const blob = userTurns.join(" ");

  if (userTurns.length === 1 && last.trim().length < 12) {
    return [
      "Happy to personalize your practice.",
      "",
      "Tell me in one message:",
      "1) role you’re applying for",
      "2) seniority (new grad / mid / senior)",
      "3) company type (startup, SaaS, marketplace, etc.)",
      "4) what feels hardest (behavioral, coding, system design, case, closing)",
      "",
      "I’ll map you to specific Interview Room scenarios with links.",
    ].join("\n");
  }

  const ranked = [...ROUNDS]
    .map((r) => ({ r, score: scoreRound(r, blob) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked.filter((x) => x.score > 0).slice(0, 4);
  const picks = (top.length ? top : ranked.slice(0, 4)).map((x) => x.r);

  const track = picks[0];
  const lines = picks.map(
    (p) => `• **${p.role} — ${p.title}** (${p.stage}, ~${p.minutes} min)\n  ${roundPath(p)}`,
  );

  const wantsMock = /mock|interview me|ask me|practice live|role.?play/i.test(last);
  if (wantsMock && track) {
    return [
      `Let’s run a short mock for **${track.role}**.`,
      "",
      `Interviewer: ${track.interviewer}`,
      "",
      "Answer in STAR (or your role’s structure). When you’re done, paste your answer and I’ll tighten it.",
      "",
      `Full scenario: ${roundPath(track)}`,
    ].join("\n");
  }

  const wantsAnswer = /here.?s my answer|my answer|how.?s this|feedback on|critique/i.test(last);
  if (wantsAnswer && last.length > 80) {
    return [
      "Solid start. Tighten it like this:",
      "",
      "1. **Situation** — one sentence of context (team, stakes).",
      "2. **Task** — your ownership, not the group’s.",
      "3. **Action** — 2–3 concrete moves you took (verbs + decisions).",
      "4. **Result** — outcome + what you’d watch earlier next time.",
      "",
      "Cut anything that blames teammates. Add one metric or observable result if you have a real one — don’t invent numbers.",
      "",
      "Want another round? Say **mock me** or name a track (e.g. product manager).",
      "",
      "Suggested next drills:",
      ...lines,
    ].join("\n");
  }

  return [
    track
      ? `Based on what you shared, lean into **${track.role}** practice (${track.setting}).`
      : "Here’s a personalized shortlist from the catalog:",
    "",
    "Recommended scenarios:",
    ...lines,
    "",
    "Reply with **mock me** to start a live interviewer prompt, or paste a draft answer for feedback.",
    "You can also open any link above to run the full playbook + debrief quiz.",
  ].join("\n");
}

export async function callAnthropic(
  apiKey: string,
  history: ChatMessage[],
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514",
      max_tokens: 700,
      system: COACH_SYSTEM,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((c) => c.type === "text")?.text?.trim();
  if (!text) throw new Error("empty Anthropic response");
  return text;
}

export async function callOpenAI(apiKey: string, history: ChatMessage[]): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 700,
      messages: [{ role: "system", content: COACH_SYSTEM }, ...history],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("empty OpenAI response");
  return text;
}
