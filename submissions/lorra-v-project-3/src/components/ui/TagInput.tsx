"use client";

import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/Badge";

type TagInputProps = {
  label: string;
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  maxTags?: number;
};

export function TagInput({
  label,
  name,
  value,
  onChange,
  placeholder = "Type and press Enter",
  hint,
  error,
  disabled,
  maxTags = 20,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().replace(/^,+|,+$/g, "");
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    if (value.length >= maxTags) return;
    onChange([...value, tag]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div
        className={[
          "flex min-h-11 flex-wrap items-center gap-2 rounded-md border bg-background px-2 py-2",
          error ? "border-danger" : "border-border",
          disabled ? "opacity-60" : "",
        ].join(" ")}
      >
        {value.map((tag) => (
          <Badge key={tag} tone="sky" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              className="ml-1 rounded px-1 text-foreground-muted hover:text-foreground"
              aria-label={`Remove ${tag}`}
              disabled={disabled}
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              ×
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={draft}
          disabled={disabled}
          placeholder={value.length ? "" : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(draft)}
          className="min-w-[8rem] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-muted/70"
          aria-label={label}
        />
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      {!error && hint ? (
        <span className="text-xs text-foreground-muted">{hint}</span>
      ) : null}
    </div>
  );
}
