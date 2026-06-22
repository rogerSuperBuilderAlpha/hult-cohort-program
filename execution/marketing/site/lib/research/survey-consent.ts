/**
 * Informed-consent content for the research survey, mirroring
 * algorithmacy-lab/org_frontier/survey/cohort_algorithmacy/instruments/consent.md (v1.0).
 *
 * Study-specific identifiers (PI name/email, IRB protocol number, IRB contact) are filled from
 * environment variables so they can be set without a code change; placeholders render until set.
 */

import { CONSENT_VERSION } from './survey-instrument';

export { CONSENT_VERSION };

const PI_NAME = process.env.NEXT_PUBLIC_RESEARCH_PI_NAME?.trim() || 'Roger Hunt';
const PI_EMAIL = process.env.NEXT_PUBLIC_RESEARCH_PI_EMAIL?.trim() || 'rhunt@bentley.edu';
const IRB_PROTOCOL = process.env.NEXT_PUBLIC_RESEARCH_IRB_PROTOCOL?.trim() || '260511078';
const IRB_CONTACT = process.env.NEXT_PUBLIC_RESEARCH_IRB_CONTACT?.trim() || 'the Bentley University IRB';

export const CONSENT = {
  version: CONSENT_VERSION,
  title: 'Informed consent to participate in research',
  studyTitle: 'Algorithmacy: Validating a measure of communication competency in AI-mediated work',
  irbLine: `Bentley University Institutional Review Board (FWA00007335) · Protocol ${IRB_PROTOCOL} · exempt determination`,
  piLine: `Principal investigator: ${PI_NAME}, Executive PhD student, Management, Bentley University · ${PI_EMAIL}`,
  intro:
    'You are invited to take part in a research study. Read this before you decide. Taking part is voluntary.',
  sections: [
    {
      heading: 'Why this study is being done',
      body:
        'The study looks at how people learn to coordinate their work through software systems — review tools, project platforms, and automated processes — over a sixteen-week program. It measures attitudes and self-assessed skills at three points in time.',
    },
    {
      heading: 'What you will be asked to do',
      body:
        'If you agree, you will complete three short surveys: one before the program\u2019s first working week, one around week 4, and one at the end of the session. Each takes about 10 to 15 minutes. There are no right or wrong answers.',
    },
    {
      heading: 'Voluntary participation',
      body:
        'Taking part is entirely your choice. You may skip any question, stop at any time, and withdraw without giving a reason. Your decision has no effect on your standing in the cohort, your assessment, your project outcomes, or your relationship with the program, Hult, or Bentley. Staff who assess your work do not see who chose to take part.',
    },
    {
      heading: 'Risks and benefits',
      body:
        'The risks are minimal and no greater than everyday reflection on your own work. The study offers no direct benefit to you. The findings may help researchers and program designers understand how people develop skill at coordinating through software systems.',
    },
    {
      heading: 'Confidentiality and data handling',
      body:
        'Your responses are confidential. Your three surveys are linked by a one-way coded identifier derived from your account, so responses can be matched across time without storing your name or handle beside your answers. Responses are stored separately from identifying records and accessible only to the research team. Results are reported only in aggregate or in a form that does not identify you. Only de-identified or aggregated data is shared publicly or deposited in the study\u2019s open repository.',
    },
    {
      heading: 'Your rights and whom to contact',
      body:
        `With questions about the study, contact ${PI_NAME} at ${PI_EMAIL}. With questions about your rights as a research participant, contact the Bentley University Institutional Review Board at ${IRB_CONTACT}.`,
    },
  ],
  statement:
    'By selecting \u201CI consent\u201D you confirm that you are 18 or older, that you have read and understood this information, and that you agree to take part.',
  declineNote:
    'Declining is final for the study only; it does not affect anything else in the program, and you keep full access to the platform and the cohort.',
};

export type ConsentContent = typeof CONSENT;
