export function StatusBadge({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] ${
        live
          ? "border-[#2d6a45] bg-[#143222] text-[var(--ok)]"
          : "border-[#6a5420] bg-[#2a220e] text-[var(--warn)]"
      }`}
    >
      {live ? "Live" : "Beta"}
    </span>
  );
}
