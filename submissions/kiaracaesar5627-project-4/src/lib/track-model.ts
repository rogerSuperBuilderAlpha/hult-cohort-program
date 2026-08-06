export type Debrief = {
  prompt: string;
  choices: string[];
  answerIndex: number;
  explain: string;
};

export type InterviewScenario = {
  slug: string;
  stage: string;
  title: string;
  minutes: number;
  summary: string;
  scenario: string;
  interviewer: string;
  playbook: string[];
  debrief: Debrief;
};

export type JobTrack = {
  slug: string;
  role: string;
  setting: string;
  blurb: string;
  scenarios: InterviewScenario[];
};

export function q(
  slug: string,
  stage: string,
  title: string,
  minutes: number,
  summary: string,
  scenario: string,
  interviewer: string,
  playbook: string[],
  debrief: Debrief,
): InterviewScenario {
  return { slug, stage, title, minutes, summary, scenario, interviewer, playbook, debrief };
}

export function d(
  prompt: string,
  choices: [string, string, string, string],
  answerIndex: 0 | 1 | 2 | 3,
  explain: string,
): Debrief {
  return { prompt, choices: [...choices], answerIndex, explain };
}
