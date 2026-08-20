import { Disclaimer } from '@/components/Disclaimer';

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 text-sm">
        <h2 className="text-xl font-bold">Privacy policy (public demo)</h2>
        <p className="mt-3">
          This public demonstration collects platform-generated opaque user identifiers, optional contact
          details you choose to provide in the calculator, and technical event metadata required for cohort
          metrics. We do not store utility account numbers or bill images on the server.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Authentication is handled via Ludwitt/Hult launch tokens (HTTP-only session cookie).</li>
          <li>
            Optional contact fields (company, address, email, phone) are saved when provided to support
            follow-up and CRM development. They are stored privately and are not published in the public
            submission repository.
          </li>
          <li>Energy calculator inputs are linked to your session when contact details are saved.</li>
          <li>Bill helper text parsing runs server-side on pasted text only — not on uploaded images.</li>
          <li>
            Ludwitt events contain opaque user ID, event name, timestamp, app version, session ID, and
            status — not optional CRM contact fields.
          </li>
        </ul>
      </section>
      <Disclaimer />
    </div>
  );
}
