import { siteUrl } from './mailgun.mjs';
import { COHORT_WEEK1_START_LABEL } from './cohort-dates.mjs';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildApplicationConfirmationHtml({
  firstName,
  takeHomeRepoUrl,
  fromName,
}) {
  const safeFirst = escapeHtml(firstName);
  const safeRepo = escapeHtml(takeHomeRepoUrl);
  const safeFrom = escapeHtml(fromName);

  return `
    <p>Hi ${safeFirst},</p>
    <p>We received your application for the Summer Pilot Cohort Developer Program.</p>
    <p><strong>Next step:</strong> Complete the 48-hour take-home.</p>
    <ul>
      <li>Repo: <a href="${safeRepo}">${safeRepo}</a></li>
      <li>Fork the repository, clone your fork, and follow the README</li>
      <li>Submit a pull request to upstream with the template filled out</li>
    </ul>
    <p>Take-home steps are also on <a href="${siteUrl()}/apply">the apply page</a> when signed in.</p>
    <p>Questions: cohort@hult.edu</p>
    <p>— ${safeFrom}</p>
  `.trim();
}

export function buildAdmissionConfirmationHtml({
  firstName,
  githubHandle,
  fromName,
}) {
  const dashboardUrl = `${siteUrl()}/dashboard`;
  const programUrl = `${siteUrl()}/program`;
  const safeFirst = escapeHtml(firstName);
  const safeHandle = escapeHtml(githubHandle);
  const safeFrom = escapeHtml(fromName);

  return `
    <p>Hi ${safeFirst},</p>
    <p>You're admitted to the <strong>Summer Pilot Cohort Developer Program</strong> (CS for Business elective).</p>
    <p><strong>Your GitHub:</strong> @${safeHandle}</p>
    <p><strong>Participant dashboard:</strong> <a href="${dashboardUrl}">${dashboardUrl}</a></p>
    <p>Sign in with the same GitHub account you used to apply. Project pages, submission tracking, and peer review tools unlock immediately.</p>
    <p><strong>Before week 1 (${COHORT_WEEK1_START_LABEL}):</strong></p>
    <ul>
      <li>Register for the elective through Hult (dual enrollment required)</li>
      <li>Review project expectations on the <a href="${programUrl}">program page</a></li>
      <li>Budget ~$400/month for Cursor and Claude Code from week 1</li>
    </ul>
    <p>Questions: cohort@hult.edu</p>
    <p>— ${safeFrom}</p>
  `.trim();
}

export function buildApplicationNotificationHtml({
  firstName,
  lastName,
  email,
  githubHandle,
  githubUrl,
  campus,
  timezone,
  referralSource,
  motivation,
  project1Idea,
}) {
  const row = (label, value) =>
    value ? `<p style="margin:2px 0"><strong>${escapeHtml(label)}:</strong> ${value}</p>` : '';
  const safeHandle = escapeHtml(githubHandle);
  const githubLink = githubUrl
    ? `<a href="${escapeHtml(githubUrl)}">@${safeHandle}</a>`
    : `@${safeHandle}`;

  return `
    <p>New application for the Summer Pilot Cohort.</p>
    ${row('Name', `${escapeHtml(firstName)} ${escapeHtml(lastName)}`)}
    ${row('Email', `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`)}
    ${row('GitHub', githubLink)}
    ${row('Campus', escapeHtml(campus))}
    ${row('Timezone', escapeHtml(timezone))}
    ${row('Referral', escapeHtml(referralSource))}
    <p style="margin:10px 0 2px"><strong>Motivation:</strong></p>
    <p style="margin:2px 0;white-space:pre-wrap">${escapeHtml(motivation)}</p>
    <p style="margin:10px 0 2px"><strong>Project 1 idea:</strong></p>
    <p style="margin:2px 0;white-space:pre-wrap">${escapeHtml(project1Idea)}</p>
    <hr />
    <p style="color:#666">Review: <code>node scripts/admissions.mjs list --status=submitted</code></p>
  `.trim();
}

/**
 * Substitute {field} merge tags from a recipient's vars.
 * Unknown tags are left blank so a missing firstName never ships "{firstName}".
 */
export function renderMergeFields(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    const v = vars?.[key];
    if (v === undefined || v === null) return '';
    return escapeHtml(String(v));
  });
}

/**
 * Wrap raw blast body HTML in a minimal branded shell with the legally required
 * unsubscribe link + physical mailing address (CAN-SPAM / CASL).
 * @param {{ bodyHtml: string; unsubscribeUrl: string; fromName: string; physicalAddress?: string }} p
 */
export function buildBlastHtml({ bodyHtml, unsubscribeUrl, fromName, physicalAddress }) {
  const address =
    physicalAddress?.trim() ||
    process.env.EMAIL_PHYSICAL_ADDRESS?.trim() ||
    '[SET EMAIL_PHYSICAL_ADDRESS — your real mailing address]';

  return `
    <div style="max-width:600px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 12px" />
      <p style="font-size:12px;color:#8a8a8a;margin:4px 0">
        You're receiving this from ${escapeHtml(fromName)}.
        <a href="${escapeHtml(unsubscribeUrl)}" style="color:#8a8a8a">Unsubscribe</a>.
      </p>
      <p style="font-size:12px;color:#8a8a8a;margin:4px 0">${escapeHtml(address)}</p>
    </div>
  `.trim();
}

export const APPLICATION_EMAIL_SUBJECT = 'Hult Cohort — application received';
export const ADMISSION_EMAIL_SUBJECT = "You're in — Hult Cohort Summer Pilot";
export const APPLICATION_NOTIFICATION_SUBJECT = 'New Hult Cohort application';
