import { siteUrl } from './mailgun.mjs';

export function buildApplicationConfirmationHtml({
  firstName,
  takeHomeRepoUrl,
  fromName,
}) {
  return `
    <p>Hi ${firstName},</p>
    <p>We received your application for the Summer Pilot Cohort Developer Program.</p>
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
    <p>You're admitted to the <strong>Summer Pilot Cohort Developer Program</strong> (CS for Business elective).</p>
    <p><strong>Your GitHub:</strong> @${githubHandle}</p>
    <p><strong>Participant dashboard:</strong> <a href="${dashboardUrl}">${dashboardUrl}</a></p>
    <p>Sign in with the same GitHub account you used to apply. Project pages, submission tracking, and peer review tools unlock immediately.</p>
    <p><strong>Before week 1 (July 9, 2026 at 09:00 Eastern Time):</strong></p>
    <ul>
      <li>Register for the elective through Hult (dual enrollment required)</li>
      <li>Review project expectations on the <a href="${programUrl}">program page</a></li>
      <li>Budget ~$400/month for Cursor and Claude Code from week 1</li>
    </ul>
    <p>Questions: cohort@hult.edu</p>
    <p>— ${fromName}</p>
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
    value ? `<p style="margin:2px 0"><strong>${label}:</strong> ${value}</p>` : '';
  const githubLink = githubUrl
    ? `<a href="${githubUrl}">@${githubHandle}</a>`
    : `@${githubHandle}`;

  return `
    <p>New application for the Summer Pilot Cohort.</p>
    ${row('Name', `${firstName} ${lastName}`)}
    ${row('Email', `<a href="mailto:${email}">${email}</a>`)}
    ${row('GitHub', githubLink)}
    ${row('Campus', campus)}
    ${row('Timezone', timezone)}
    ${row('Referral', referralSource)}
    <p style="margin:10px 0 2px"><strong>Motivation:</strong></p>
    <p style="margin:2px 0;white-space:pre-wrap">${motivation}</p>
    <p style="margin:10px 0 2px"><strong>Project 1 idea:</strong></p>
    <p style="margin:2px 0;white-space:pre-wrap">${project1Idea}</p>
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
    return v === undefined || v === null ? '' : String(v);
  });
}

/**
 * Wrap raw blast body HTML in a minimal branded shell with the legally required
 * unsubscribe link + physical mailing address (CAN-SPAM / CASL).
 * @param {{ bodyHtml: string; unsubscribeUrl: string; fromName: string; physicalAddress?: string }} p
 */
export function buildBlastHtml({ bodyHtml, unsubscribeUrl, fromName, physicalAddress }) {
  // CAN-SPAM/CASL require a REAL physical mailing address. Set EMAIL_PHYSICAL_ADDRESS —
  // this placeholder is intentionally obvious so a real blast can't ship a fake address.
  const address =
    physicalAddress?.trim() ||
    process.env.EMAIL_PHYSICAL_ADDRESS?.trim() ||
    '[SET EMAIL_PHYSICAL_ADDRESS — your real mailing address]';

  return `
    <div style="max-width:600px;margin:0 auto;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a">
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 12px" />
      <p style="font-size:12px;color:#8a8a8a;margin:4px 0">
        You're receiving this from ${fromName}.
        <a href="${unsubscribeUrl}" style="color:#8a8a8a">Unsubscribe</a>.
      </p>
      <p style="font-size:12px;color:#8a8a8a;margin:4px 0">${address}</p>
    </div>
  `.trim();
}

export const APPLICATION_EMAIL_SUBJECT = 'Hult Cohort — application received';
export const ADMISSION_EMAIL_SUBJECT = "You're in — Hult Cohort Summer Pilot";
export const APPLICATION_NOTIFICATION_SUBJECT = 'New Hult Cohort application';
