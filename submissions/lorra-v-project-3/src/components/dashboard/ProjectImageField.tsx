"use client";

import { useRef, useState, useTransition } from "react";
import { uploadImageAction } from "@/app/dashboard/upload-actions";
import { Button } from "@/components/ui/Button";

type ProjectImageFieldProps = {
  userId: string;
  projectId?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
};

export function ProjectImageField({
  projectId,
  value,
  onChange,
  disabled,
}: ProjectImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFileChange(file: File | undefined) {
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("bucket", "project-media");
    formData.set("folder", projectId || "drafts");
    formData.set("filenameStem", "cover");
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
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border bg-background-muted">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Project cover"
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center text-sm text-foreground-muted">
            No cover image yet
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? "Uploading…" : value ? "Replace image" : "Upload image"}
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
        PNG, JPEG, WebP, or GIF · max 10 MB.
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
  );
}
