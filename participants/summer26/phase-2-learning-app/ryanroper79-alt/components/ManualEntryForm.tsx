'use client';

export function ManualEntryForm() {
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: fd.get('title'),
        funder: fd.get('funder'),
        country: fd.get('country'),
        sector: fd.get('sector'),
        stage: fd.get('stage'),
        estimatedValueUsd: fd.get('estimatedValueUsd'),
        rawText: fd.get('rawText'),
      }),
    });
    if (res.ok) window.location.href = '/finder';
    else alert(await res.text());
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-3 rounded-xl border bg-white p-5">
      <h3 className="font-semibold">Manual opportunity entry (Tier 3)</h3>
      <input name="title" placeholder="Title" required className="w-full rounded border px-3 py-2 text-sm" />
      <input name="funder" placeholder="Funder" required className="w-full rounded border px-3 py-2 text-sm" />
      <input name="country" placeholder="Country" className="w-full rounded border px-3 py-2 text-sm" />
      <input name="sector" placeholder="Sector" className="w-full rounded border px-3 py-2 text-sm" />
      <select name="stage" className="w-full rounded border px-3 py-2 text-sm">
        <option value="rfp">RFP</option>
        <option value="eoi">EOI</option>
        <option value="plan">Plan (watchlist)</option>
        <option value="notice">Notice</option>
      </select>
      <input name="estimatedValueUsd" type="number" placeholder="Value USD" className="w-full rounded border px-3 py-2 text-sm" />
      <textarea name="rawText" placeholder="Notice text / scope" rows={3} className="w-full rounded border px-3 py-2 text-sm" />
      <button type="submit" className="rounded-lg bg-ceal-700 px-4 py-2 text-sm text-white">Add opportunity</button>
    </form>
  );
}
