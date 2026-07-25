/** Teal network-C mark used on the public landing nav. */
export function ConexusMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M28.5 10.2C26.2 7.7 23 6.2 19.5 6.2C12.3 6.2 6.5 12 6.5 19.2C6.5 26.4 12.3 32.2 19.5 32.2C23 32.2 26.2 30.7 28.5 28.2"
        stroke="var(--color-primary)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="12.5" cy="19.2" r="2.2" fill="var(--color-primary)" />
      <circle cx="19.2" cy="14.8" r="2" fill="var(--color-primary)" />
      <circle cx="19.2" cy="23.6" r="2" fill="var(--color-primary)" />
      <path
        d="M12.5 19.2L19.2 14.8M12.5 19.2L19.2 23.6"
        stroke="var(--color-primary)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
