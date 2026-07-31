"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Props = {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "url";
  disabled?: boolean;
  addLabel?: string;
};

/** Repeatable text/URL rows for achievements, evidence links, etc. */
export function RepeatableListInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  disabled,
  addLabel = "Add item",
}: Props) {
  const rows = value.length > 0 ? value : [""];

  function updateRow(index: number, next: string) {
    const copy = [...rows];
    copy[index] = next;
    onChange(copy);
  }

  function removeRow(index: number) {
    const copy = rows.filter((_, i) => i !== index);
    onChange(copy.length ? copy : [""]);
  }

  function addRow() {
    onChange([...rows, ""]);
  }

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium text-foreground">{label}</legend>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type={type}
              value={row}
              onChange={(e) => updateRow(index, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || (rows.length === 1 && !row)}
              onClick={() => removeRow(index)}
              aria-label={`Remove ${label} item ${index + 1}`}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={addRow}
      >
        {addLabel}
      </Button>
      {hint ? (
        <p className="text-xs text-foreground-muted">{hint}</p>
      ) : null}
    </fieldset>
  );
}
