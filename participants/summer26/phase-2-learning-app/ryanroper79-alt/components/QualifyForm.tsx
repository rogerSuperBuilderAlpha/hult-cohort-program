'use client';

import type { QualDimension } from '@/lib/bidmanager/types';

const DIMENSIONS: { key: QualDimension; label: string; hint: string }[] = [
  { key: 'relationship_depth', label: 'Relationship depth', hint: 'Prior work, named contact, plan-stage involvement' },
  { key: 'mandatory_criteria_fit', label: 'Mandatory criteria fit', hint: 'Every eligibility item with verified evidence' },
  { key: 'evidence_coverage', label: 'Evidence coverage', hint: 'Share of weighted criteria with full library coverage' },
  { key: 'competitive_position', label: 'Competitive position', hint: 'Incumbent, bidder count, local advantage' },
  { key: 'commercial_value', label: 'Commercial value', hint: 'Value vs effort, margin, follow-on' },
  { key: 'capacity', label: 'Capacity', hint: 'Team availability vs deadline' },
];

type Props = {
  opportunityId: string;
  initialScores?: Partial<Record<QualDimension, number>>;
  recommendation?: string;
};

export function QualifyForm({ opportunityId, initialScores }: Props) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const dimensionScores = Object.fromEntries(
      DIMENSIONS.map((d) => [d.key, Number(fd.get(d.key) ?? 50)])
    ) as Record<QualDimension, number>;

    const res = await fetch(`/api/opportunities/${opportunityId}/qualify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dimensionScores,
        memberCountryEligible: fd.get('memberCountryEligible') === 'on',
        decision: fd.get('decision') || undefined,
        overrideReason: fd.get('overrideReason') || undefined,
      }),
    });
    if (res.ok) window.location.reload();
    else alert(await res.text());
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4 rounded-xl border border-ceal-500/15 bg-ceal-50/40 p-5">
      <h3 className="font-semibold text-ceal-900">Qualifier — score dimensions (0–100)</h3>
      {DIMENSIONS.map((d) => (
        <label key={d.key} className="block text-sm">
          <span className="font-medium">{d.label}</span>
          <span className="ml-2 text-ceal-700/70">{d.hint}</span>
          <input
            type="range"
            name={d.key}
            min={0}
            max={100}
            defaultValue={initialScores?.[d.key] ?? 50}
            className="mt-1 w-full"
          />
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="memberCountryEligible" defaultChecked />
        Funder member-country eligibility satisfied
      </label>
      <label className="block text-sm">
        Override decision (optional)
        <select name="decision" className="mt-1 w-full rounded border px-2 py-1">
          <option value="">Use gate recommendation</option>
          <option value="bid">Force bid</option>
          <option value="partner_only">Force partner only</option>
          <option value="no_bid">Force no-bid</option>
        </select>
      </label>
      <label className="block text-sm">
        Override reason (required if overriding no-bid gate)
        <textarea name="overrideReason" rows={2} className="mt-1 w-full rounded border px-2 py-1" />
      </label>
      <button type="submit" className="rounded-lg bg-ceal-700 px-4 py-2 text-sm font-medium text-white hover:bg-ceal-900">
        Run Qualifier · emit qualification.scored
      </button>
    </form>
  );
}
