"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImageAction } from "@/app/dashboard/upload-actions";
import { Button } from "@/components/ui/Button";
import { initialsFromName } from "@/lib/slug";

type AvatarFieldProps = {
  userId: string;
  name: string | null;
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
};

export function AvatarField({
  name,
  value,
  onChange,
  disabled,
}: AvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFileChange(file: File | undefined) {
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("bucket", "avatars");
    formData.set("filenameStem", "avatar");
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChange(result.publicUrl);
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background-muted font-display text-xl font-semibold text-accent">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt={name ? `${name} avatar` : "Avatar"}
            className="size-full object-cover"
          />
        ) : (
          <span aria-hidden>{initialsFromName(name)}</span>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || pending}
              onClick={() => onChange(null)}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-foreground-muted">
          PNG, JPEG, WebP, or GIF · max 5 MB. Falls back to initials if empty.
        </p>
        {error ? (
          <p role="alert" className="max-w-md text-xs text-danger">
            {error}
          </p>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            e.target.value = "";
            onFileChange(selected);
          }}
        />
      </div>
    </div>
  );
}
