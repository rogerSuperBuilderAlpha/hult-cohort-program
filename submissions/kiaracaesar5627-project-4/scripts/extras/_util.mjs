export function sc(slug, stage, title, minutes, summary, scenario, interviewer, playbook, prompt, choices, answer, explain) {
  if (!/\?$/.test(interviewer.trim())) {
    throw new Error(`Interview question must end with ?: ${slug} → ${interviewer}`);
  }
  return { slug, stage, title, minutes, summary, scenario, interviewer, playbook, prompt, choices, answer, explain };
}

export function esc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function renderSc(s) {
  const pb = s.playbook.map((p) => `          '${esc(p)}'`).join(",\n");
  const ch = s.choices.map((c) => `            '${esc(c)}'`).join(",\n");
  return `      q(
        '${s.slug}',
        '${esc(s.stage)}',
        '${esc(s.title)}',
        ${s.minutes},
        '${esc(s.summary)}',
        '${esc(s.scenario)}',
        '${esc(s.interviewer)}',
        [
${pb},
        ],
        d(
          '${esc(s.prompt)}',
          [
${ch},
          ],
          ${s.answer},
          '${esc(s.explain)}',
        ),
      )`;
}
