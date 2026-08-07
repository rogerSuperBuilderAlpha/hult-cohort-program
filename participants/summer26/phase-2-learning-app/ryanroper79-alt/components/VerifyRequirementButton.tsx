'use client';

type Props = {
  requirementId: string;
};

export function VerifyRequirementButton({ requirementId }: Props) {
  async function handleVerify() {
    const res = await fetch(`/api/requirements/${requirementId}/verify`, { method: 'POST' });
    if (res.ok) window.location.reload();
    else alert(await res.text());
  }

  return (
    <button
      type="button"
      onClick={() => void handleVerify()}
      className="rounded-lg bg-ceal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-ceal-900"
    >
      Confirm requirement
    </button>
  );
}
