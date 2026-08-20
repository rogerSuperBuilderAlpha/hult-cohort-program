import { DISCLAIMER } from '@/lib/constants';

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <aside
      className={`rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 ${className}`}
      role="note"
    >
      <p className="font-semibold">Important disclaimer</p>
      <p className="mt-2">{DISCLAIMER}</p>
    </aside>
  );
}
