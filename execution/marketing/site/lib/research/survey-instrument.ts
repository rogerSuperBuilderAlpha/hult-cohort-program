/**
 * Canonical research-survey instrument for the cohort algorithmacy panel.
 *
 * Mirrors the open-science study in algorithmacy-lab:
 *   org_frontier/survey/cohort_algorithmacy/ (codebook.md + instruments/).
 * Item ids, wording, scales, and reverse keys match that codebook exactly so the public
 * pre-registration and the fielded instrument stay in lockstep. Edit both together.
 *
 * Client- and server-safe: no firebase-admin import.
 */

export type ResponseScale = 'A7' | 'A5' | 'CAT' | 'TEXT';

export type SurveyOption = { value: string; label: string };

export type SurveyItem = {
  id: string;
  text: string;
  scale: ResponseScale;
  /** Reverse-scored at analysis. The participant sees an ordinary statement. */
  reverse?: boolean;
  /** Options for a CAT (single-select) item. */
  options?: SurveyOption[];
  /** Free-text only shown when another item has a given value. */
  showIf?: { id: string; equals: string };
};

export type SurveySection = {
  title: string;
  intro?: string;
  /** Default Likert anchor set for this section. */
  scale: ResponseScale;
  items: SurveyItem[];
};

export type SurveyWaveId = 'w1' | 'w2' | 'w3';

export type SurveyWave = {
  id: SurveyWaveId;
  label: string;
  shortLabel: string;
  intro: string;
  opensAt: string;
  closesAt: string;
  estimatedMinutes: number;
  sections: SurveySection[];
};

export const CONSENT_VERSION = '1.0';

/** Anchor labels for rendering Likert items. */
export const SCALE_ANCHORS: Record<'A7' | 'A5', string[]> = {
  A7: [
    'Strongly disagree',
    'Disagree',
    'Somewhat disagree',
    'Neither agree nor disagree',
    'Somewhat agree',
    'Agree',
    'Strongly agree',
  ],
  A5: ['Strongly disagree', 'Disagree', 'Neither', 'Agree', 'Strongly agree'],
};

// ----------------------------------------------------------------------------------------
// Shared item banks — identical wording across waves to support measurement invariance.
// ----------------------------------------------------------------------------------------

const ACS_ITEMS: SurveyItem[] = [
  { id: 'acs_ci_1', scale: 'A7', text: 'I can usually work out what reviewers want from the feedback they leave, even when they do not spell it out.' },
  { id: 'acs_ci_2', scale: 'A7', text: 'When a tool or system gives me a result, I can reason back to what it was checking for.' },
  { id: 'acs_ci_3', scale: 'A7', text: 'I form accurate expectations about what will pass review before I submit.' },
  { id: 'acs_ci_4', scale: 'A7', text: 'I read past the surface of automated feedback to the rule behind it.' },
  { id: 'acs_sc_1', scale: 'A7', text: 'I am good at expressing what I mean in the narrow format a tool or reviewer will accept.' },
  { id: 'acs_sc_2', scale: 'A7', text: 'I can reduce a complex piece of work to the few signals that decide whether it is accepted.' },
  { id: 'acs_sc_3', scale: 'A7', text: 'When a system accepts only certain inputs, I can package what I intend to fit them.' },
  { id: 'acs_sc_4', scale: 'A7', text: 'I know which parts of my work to make visible so the system or reviewer reads it correctly.' },
  { id: 'acs_rt_1', scale: 'A7', text: 'I notice when the rules of a tool or process have quietly changed.' },
  { id: 'acs_rt_2', scale: 'A7', text: 'I keep track of how requirements shift over time, even when no one announces it.' },
  { id: 'acs_rt_3', scale: 'A7', text: 'I adjust quickly when a system starts behaving differently than before.' },
  { id: 'acs_rt_4', scale: 'A7', text: 'I can tell when what worked last time will no longer work.' },
];

const TI_ITEMS: SurveyItem[] = [
  { id: 'ti_1', scale: 'A7', text: 'I have to work closely with other members of the cohort to get my work done.' },
  { id: 'ti_2', scale: 'A7', text: 'My work depends on the work of others in the cohort, and theirs depends on mine.' },
  { id: 'ti_3', scale: 'A7', text: 'Members of the cohort rely on one another for information and materials.' },
  { id: 'ti_4', scale: 'A7', text: 'I cannot complete my work well without input from others in the cohort.' },
  { id: 'ti_5', scale: 'A7', text: 'How I do my work directly affects others, and how they do theirs affects me.' },
];

const SA_ITEMS: SurveyItem[] = [
  { id: 'sa_1', scale: 'A7', text: 'The platform and review process here decide outcomes, not just pass information along.' },
  { id: 'sa_2', scale: 'A7', text: 'When the system produces a result, it stands, and people act on it as settled.' },
  { id: 'sa_3', scale: 'A7', reverse: true, text: 'The tools we coordinate through only relay what people have already decided.' },
  { id: 'sa_4', scale: 'A7', text: 'The review-and-vote process commits a decision that no individual could reach alone.' },
  { id: 'sa_5', scale: 'A7', reverse: true, text: 'The system only carries our messages; the real decisions are made directly between people.' },
  { id: 'sa_6', scale: 'A7', text: 'What the platform determines binds everyone, whether or not they agree.' },
];

const AU_ITEMS: SurveyItem[] = [
  { id: 'au_m_1', scale: 'A7', text: 'I decide how to go about getting my work done.' },
  { id: 'au_m_2', scale: 'A7', text: 'I choose the procedures I use to carry out my work.' },
  { id: 'au_m_3', scale: 'A7', text: 'I am free to choose the methods I use in my work.' },
  { id: 'au_s_1', scale: 'A7', text: 'I control the scheduling of my work.' },
  { id: 'au_s_2', scale: 'A7', text: 'I have control over the sequencing of my work activities.' },
  { id: 'au_s_3', scale: 'A7', text: 'I decide when to do particular work activities.' },
  { id: 'au_c_1', scale: 'A7', text: 'I have some control over what I am supposed to accomplish.' },
  { id: 'au_c_2', scale: 'A7', text: 'I am able to modify the objectives of my work.' },
  { id: 'au_c_3', scale: 'A7', text: 'I am able to influence the standards by which my work is judged.' },
];

const PO_ITEMS: SurveyItem[] = [
  { id: 'po_1', scale: 'A7', text: 'I feel a high degree of personal ownership of the work I build in this cohort.' },
  { id: 'po_2', scale: 'A7', text: 'I sense that the project I build is mine.' },
  { id: 'po_3', scale: 'A7', text: 'This is MY platform.' },
  { id: 'po_4', scale: 'A7', text: 'I feel the work I build here is mine to look after.' },
  { id: 'po_5', scale: 'A7', reverse: true, text: 'It is hard for me to think of the project as mine.' },
  { id: 'po_6', scale: 'A7', text: 'I invest a great deal of myself in what I build here.' },
];

const TMS_ITEMS: SurveyItem[] = [
  { id: 'tms_s_1', scale: 'A5', text: 'Each cohort member has specialized knowledge of some aspect of our work.' },
  { id: 'tms_s_2', scale: 'A5', text: 'I have knowledge about an aspect of the work that no other member has.' },
  { id: 'tms_s_3', scale: 'A5', text: 'Different members are responsible for expertise in different areas.' },
  { id: 'tms_s_4', scale: 'A5', text: 'The specialized knowledge of several different members is needed to finish our projects.' },
  { id: 'tms_s_5', scale: 'A5', text: 'I know which members have expertise in specific areas.' },
  { id: 'tms_c_1', scale: 'A5', text: 'I am comfortable accepting procedural suggestions from other members.' },
  { id: 'tms_c_2', scale: 'A5', text: 'I trust that other members\u2019 knowledge about the work is credible.' },
  { id: 'tms_c_3', scale: 'A5', text: 'I am confident relying on the information other members bring.' },
  { id: 'tms_c_4', scale: 'A5', reverse: true, text: 'When other members give information, I want to double-check it.' },
  { id: 'tms_c_5', scale: 'A5', reverse: true, text: 'I do not have much faith in other members\u2019 expertise.' },
  { id: 'tms_co_1', scale: 'A5', text: 'Our cohort works together in a well-coordinated way.' },
  { id: 'tms_co_2', scale: 'A5', text: 'Our cohort has few misunderstandings about what to do.' },
  { id: 'tms_co_3', scale: 'A5', reverse: true, text: 'Our cohort has to backtrack and start over a lot.' },
  { id: 'tms_co_4', scale: 'A5', text: 'We accomplish tasks smoothly and efficiently.' },
  { id: 'tms_co_5', scale: 'A5', reverse: true, text: 'There is much confusion about how we will accomplish tasks.' },
];

const SU_ITEMS: SurveyItem[] = [
  { id: 'su_1', scale: 'A7', text: 'If I dropped out, the cohort\u2019s work would carry on largely unchanged.' },
  { id: 'su_2', scale: 'A7', text: 'Someone else could easily do the part I play here.' },
  { id: 'su_3', scale: 'A7', reverse: true, text: 'My specific contribution would be hard to replace.' },
  { id: 'su_4', scale: 'A7', text: 'The coordination here does not really depend on me in particular.' },
];

const SE_ITEMS: SurveyItem[] = [
  { id: 'se_1', scale: 'A7', text: 'I will be able to achieve most of the goals I set for myself.' },
  { id: 'se_2', scale: 'A7', text: 'When facing difficult tasks, I am certain I will accomplish them.' },
  { id: 'se_3', scale: 'A7', text: 'In general, I think I can obtain outcomes that are important to me.' },
  { id: 'se_4', scale: 'A7', text: 'I believe I can succeed at most any endeavor I set my mind to.' },
  { id: 'se_5', scale: 'A7', text: 'I will be able to overcome many challenges successfully.' },
  { id: 'se_6', scale: 'A7', text: 'I am confident I can perform effectively on many different tasks.' },
  { id: 'se_7', scale: 'A7', text: 'Compared with other people, I can do most tasks very well.' },
  { id: 'se_8', scale: 'A7', text: 'Even when things are tough, I can perform quite well.' },
];

const BE_ITEMS: SurveyItem[] = [
  { id: 'be_1', scale: 'A7', text: 'I feel like I belong in this cohort.' },
  { id: 'be_2', scale: 'A7', reverse: true, text: 'I feel like an outsider in this cohort.' },
  { id: 'be_3', scale: 'A7', text: 'I fit in well with the people in this cohort.' },
  { id: 'be_4', scale: 'A7', text: 'People in this cohort accept me.' },
];

const DEM_ITEMS: SurveyItem[] = [
  {
    id: 'dem_age', scale: 'CAT', text: 'Age range.',
    options: [
      { value: '18-24', label: '18\u201324' },
      { value: '25-34', label: '25\u201334' },
      { value: '35-44', label: '35\u201344' },
      { value: '45plus', label: '45+' },
      { value: 'na', label: 'Prefer not to say' },
    ],
  },
  {
    id: 'dem_gender', scale: 'CAT', text: 'Gender.',
    options: [
      { value: 'woman', label: 'Woman' },
      { value: 'man', label: 'Man' },
      { value: 'nonbinary', label: 'Non-binary' },
      { value: 'self', label: 'Prefer to self-describe' },
      { value: 'na', label: 'Prefer not to say' },
    ],
  },
  {
    id: 'dem_education', scale: 'CAT', text: 'Highest level of education completed.',
    options: [
      { value: 'secondary', label: 'Secondary' },
      { value: 'some_college', label: 'Some college' },
      { value: 'bachelors', label: "Bachelor's" },
      { value: 'masters', label: "Master's" },
      { value: 'doctoral', label: 'Doctoral' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'dem_coding_years', scale: 'CAT', text: 'Years of programming experience.',
    options: [
      { value: 'lt1', label: 'Less than 1' },
      { value: '1-2', label: '1\u20132' },
      { value: '3-5', label: '3\u20135' },
      { value: '6-10', label: '6\u201310' },
      { value: 'gt10', label: 'More than 10' },
    ],
  },
  {
    id: 'dem_platform_work', scale: 'CAT',
    text: 'Have you worked through an online platform or gig app (rideshare, delivery, freelance marketplace, etc.)?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'na', label: 'Prefer not to say' },
    ],
  },
  { id: 'dem_platform_kind', scale: 'TEXT', text: 'If yes, which kind(s)?', showIf: { id: 'dem_platform_work', equals: 'yes' } },
  {
    id: 'dem_region', scale: 'CAT', text: 'Region of residence.',
    options: [
      { value: 'africa', label: 'Africa' },
      { value: 'asia', label: 'Asia' },
      { value: 'europe', label: 'Europe' },
      { value: 'north_america', label: 'North America' },
      { value: 'south_america', label: 'South America' },
      { value: 'oceania', label: 'Oceania' },
      { value: 'na', label: 'Prefer not to say' },
    ],
  },
];

const EXP_L_ITEMS: SurveyItem[] = [
  { id: 'exp_l_1', scale: 'A7', text: 'I learned a great deal in this program.' },
  { id: 'exp_l_2', scale: 'A7', text: 'My ability to coordinate through tools and systems improved over the program.' },
  { id: 'exp_l_3', scale: 'A7', text: 'I am better at reading what a system or reviewer wants than I was at the start.' },
];

const EXP_OPEN_ITEMS: SurveyItem[] = [
  { id: 'exp_open_1', scale: 'TEXT', text: 'Describe a time you worked out what a system or reviewer wanted without being told directly.' },
  { id: 'exp_open_2', scale: 'TEXT', text: 'How did the way you read the cohort\u2019s tools and review process change over the program?' },
  { id: 'exp_open_3', scale: 'TEXT', text: 'Anything else about coordinating through the platforms you want to add?' },
];

// ----------------------------------------------------------------------------------------
// Section templates
// ----------------------------------------------------------------------------------------

const sec = {
  acs: (): SurveySection => ({ title: 'How you read tools and feedback', scale: 'A7', items: ACS_ITEMS }),
  ti: (): SurveySection => ({ title: 'Working with the cohort', scale: 'A7', items: TI_ITEMS }),
  sa: (): SurveySection => ({ title: 'The review process and the platform', scale: 'A7', items: SA_ITEMS }),
  au: (): SurveySection => ({ title: 'Control over your work', scale: 'A7', items: AU_ITEMS }),
  po: (): SurveySection => ({ title: 'What you build', scale: 'A7', items: PO_ITEMS }),
  tms: (): SurveySection => ({ title: 'How the cohort knows what it knows', scale: 'A5', items: TMS_ITEMS }),
  su: (): SurveySection => ({ title: 'Your place in the cohort', scale: 'A7', items: SU_ITEMS }),
  se: (): SurveySection => ({ title: 'About yourself in general', scale: 'A7', items: SE_ITEMS }),
  be: (): SurveySection => ({ title: 'Belonging', scale: 'A7', items: BE_ITEMS }),
};

// ----------------------------------------------------------------------------------------
// The three waves, with their administration windows.
// ----------------------------------------------------------------------------------------

export const SURVEY_WAVES: SurveyWave[] = [
  {
    id: 'w1',
    label: 'Baseline survey',
    shortLabel: 'Baseline (before Project 1)',
    intro:
      'These questions ask how you work and how you read the tools and people you work with. There are no right answers. Answer for how things are for you as you begin the program. The wording is the same across all three surveys so we can measure change on the same scale.',
    // Opens before week 1; stays completable through Project 1's submission window because it gates
    // access to Project 1 (see SURVEY_GATES). Keeping it open avoids a permanent lock-out.
    opensAt: '2026-07-09T04:00:00.000Z',
    closesAt: '2026-07-22T21:00:00.000Z',
    estimatedMinutes: 12,
    sections: [sec.acs(), sec.ti(), sec.au(), sec.su(), sec.be(), sec.se(), { title: 'Background', intro: 'All optional.', scale: 'CAT', items: DEM_ITEMS }],
  },
  {
    id: 'w2',
    label: 'Midpoint survey',
    shortLabel: 'Midpoint (week 3)',
    intro:
      'You have now built a project and gone through review once. Answer for how things are for you now.',
    // Opens after the first review; stays completable through Project 2's submission window because it
    // gates access to Project 2 (see SURVEY_GATES). Keeping it open avoids a permanent lock-out.
    opensAt: '2026-07-23T18:00:00.000Z',
    closesAt: '2026-07-29T21:00:00.000Z',
    estimatedMinutes: 13,
    sections: [sec.acs(), sec.sa(), sec.ti(), sec.au(), sec.po(), sec.tms(), sec.su(), sec.be()],
  },
  {
    id: 'w3',
    label: 'End-of-session survey',
    shortLabel: 'End of session (week 6)',
    intro:
      'This is the last survey. Answer for how things are for you now, at the end of the program.',
    opensAt: '2026-08-17T13:00:00.000Z',
    closesAt: '2026-08-20T03:59:00.000Z',
    estimatedMinutes: 15,
    sections: [
      sec.acs(), sec.sa(), sec.ti(), sec.au(), sec.po(), sec.tms(), sec.su(), sec.be(), sec.se(),
      { title: 'Looking back on the program', scale: 'A7', items: EXP_L_ITEMS },
      { title: 'In your own words', intro: 'Optional.', scale: 'TEXT', items: EXP_OPEN_ITEMS },
    ],
  },
];

export type WaveStatus = 'not-yet' | 'open' | 'closed';

/** Staff/E2E: SURVEY_WINDOW_OVERRIDE = w1 | w2 | w3 | all forces a wave open. Server-side only. */
function windowOverride(): string | null {
  return process.env.SURVEY_WINDOW_OVERRIDE?.trim() || null;
}

export function getWaveById(id: SurveyWaveId): SurveyWave | undefined {
  return SURVEY_WAVES.find((w) => w.id === id);
}

export function waveStatus(wave: SurveyWave, now = new Date()): WaveStatus {
  const override = windowOverride();
  if (override === 'all' || override === wave.id) return 'open';
  const t = now.getTime();
  if (t < new Date(wave.opensAt).getTime()) return 'not-yet';
  if (t > new Date(wave.closesAt).getTime()) return 'closed';
  return 'open';
}

/** The single wave currently open, if any. */
export function openWave(now = new Date()): SurveyWave | null {
  return SURVEY_WAVES.find((w) => waveStatus(w, now) === 'open') ?? null;
}

/** All item ids expected in a wave, for server-side validation. */
export function waveItemIds(wave: SurveyWave): string[] {
  return wave.sections.flatMap((s) => s.items.map((i) => i.id));
}

// ----------------------------------------------------------------------------------------
// Survey gates — projects that participants cannot open until they have addressed a wave.
//
// "Addressed" means either submitted the wave OR declined the study on the survey page. Because
// the IRB consent guarantees participation is voluntary with no effect on standing, declining must
// still unlock the project; only *skipping the step entirely* is blocked. Enforced in the UI by
// ProgramProjectView/EnrolledView.
// ----------------------------------------------------------------------------------------

export const SURVEY_GATES: Record<string, SurveyWaveId> = {
  // The baseline survey must be addressed before the Phase 1 project-management build (Project 1).
  'phase-1-project-1': 'w1',
  // The week-4 (midpoint) survey must be addressed before the next Phase 1 build (Project 2).
  'phase-1-project-2': 'w2',
};

/** The wave that gates a project, if any. */
export function requiredWaveForProject(slug: string): SurveyWaveId | null {
  return SURVEY_GATES[slug] ?? null;
}
