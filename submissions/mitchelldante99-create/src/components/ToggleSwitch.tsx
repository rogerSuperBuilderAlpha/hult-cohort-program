"use client";

export default function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-xs font-medium select-none"
      style={{ color: "var(--text-muted)" }}
    >
      <span
        className="relative inline-flex items-center rounded-full transition-colors"
        style={{
          width: 34,
          height: 20,
          background: checked ? "var(--accent)" : "var(--border)",
        }}
      >
        <span
          className="absolute rounded-full bg-white transition-transform"
          style={{
            width: 16,
            height: 16,
            top: 2,
            left: 2,
            transform: checked ? "translateX(14px)" : "translateX(0)",
          }}
        />
      </span>
      {label}
    </button>
  );
}
