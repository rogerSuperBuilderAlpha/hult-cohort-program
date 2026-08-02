"use client";

type CheckboxGroupProps = {
  label: string;
  name: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
};

export function CheckboxGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  hint,
  disabled,
}: CheckboxGroupProps) {
  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = value.includes(option);
          return (
            <label
              key={option}
              className={[
                "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition",
                checked
                  ? "border-accent/50 bg-accent/10 text-foreground"
                  : "border-border bg-background text-foreground-muted hover:border-border-strong",
              ].join(" ")}
            >
              <input
                type="checkbox"
                value={option}
                checked={checked}
                onChange={() => toggle(option)}
                className="size-4 accent-[var(--accent)]"
                aria-label={option}
                data-group={name}
              />
              {option}
            </label>
          );
        })}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {!error && hint ? (
        <p className="text-xs text-foreground-muted">{hint}</p>
      ) : null}
    </fieldset>
  );
}
