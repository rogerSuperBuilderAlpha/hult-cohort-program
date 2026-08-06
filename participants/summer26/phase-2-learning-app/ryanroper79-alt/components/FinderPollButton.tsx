'use client';

export function FinderPollButton() {
  async function poll() {
    const res = await fetch('/api/finder/poll', { method: 'POST' });
    const data = await res.json();
    alert(`Finder poll complete: ${data.discovered} opportunities, ${data.screened} sent to screening.`);
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={() => void poll()}
      className="rounded-lg border border-ceal-600 px-4 py-2 text-sm font-medium text-ceal-800 hover:bg-ceal-50"
    >
      Poll IDB · CCREEE · Caribbean Export sources
    </button>
  );
}
