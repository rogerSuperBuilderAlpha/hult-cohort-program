import { siteUrl } from './mailgun.mjs';

export function buildApplicationConfirmationHtml({
  firstName,
  takeHomeRepoUrl,
  fromName,
}) {
  return `
    <p>Hi ${firstName},</p>
    <p>We received your application for the Fall 2026 Cohort Developer Program.</p>
    <p><strong>Next step:</strong> Complete the 48-hour take-home.</p>
    <ul>
      <li>Repo: <a href="${takeHomeRepoUrl}">${takeHomeRepoUrl}</a></li>
      <li>Fork the repository, clone your fork, and follow the README</li>
      <li>Submit a pull request to upstream with the template filled out</li>
    </ul>
    <p>Take-home steps are also on <a href="${siteUrl()}/apply">the apply page</a> when signed in.</p>
    <p>Questions: cohort@hult.edu</p>
    <p>— ${fromName}</p>
  `.trim();
}

export function buildAdmissionConfirmationHtml({
  firstName,
  githubHandle,
  fromName,
}) {
  const dashboardUrl = `${siteUrl()}/dashboard`;
  const programUrl = `${siteUrl()}/program`;

  return `
    <p>Hi ${firstName},</p>
    <p>You're admitted to the <strong>Fall 2026 Cohort Developer Program</strong> (CS for Business elective).</p>
    <p><strong>Your GitHub:</strong> @${githubHandle}</p>
    <p><strong>Participant dashboard:</strong> <a href="${dashboardUrl}">${dashboardUrl}</a></p>
    <p>Sign in with the same GitHub account you used to apply. Project pages, submission tracking, and peer review tools unlock immediately.</p>
    <p><strong>Before week 1 (September 8, 2026):</strong></p>
    <ul>
      <li>Register for the elective through Hult (dual enrollment required)</li>
      <li>Review project expectations on the <a href="${programUrl}">program page</a></li>
      <li>Budget ~$400/month for Cursor and Claude Code from week 1</li>
    </ul>
    <p>Questions: cohort@hult.edu</p>
    <p>— ${fromName}</p>
  `.trim();
}

export const APPLICATION_EMAIL_SUBJECT = 'Hult Cohort — application received';
export const ADMISSION_EMAIL_SUBJECT = "You're in — Hult Cohort Fall 2026";
