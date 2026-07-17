'use client';

import { cloneElement, useEffect, useId, useRef } from 'react';

/**
 * Shared primitives. Deliberately small — the spec's visual language is two weights, four
 * type sizes, hairline borders, and exactly two colours with meaning:
 * green = the motivating action, red = debt or time against you. Nothing else is coloured.
 */

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Focus moves into the dialog or a keyboard user is left behind it.
    ref.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // Full-bleed sheet on a phone, centred card above it. dvh, never vh — vh is wrong
        // under a mobile browser's collapsing toolbar.
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-zinc-800 bg-zinc-900 p-5 sm:max-w-lg sm:rounded-lg"
      >
        <h2 className="mb-4 text-sm font-medium text-zinc-100">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/**
 * A labelled control.
 *
 * Explicit htmlFor/id association, not a wrapping <label>. Wrapping looks tidier but
 * computes the accessible name from the label's whole text content — which swallows both
 * the hint and, for a <select>, every option. The project picker announced itself as
 * "Project ProbeProj Shape 17..." and the date field as "Due Optional. Red if past."
 *
 * The hint is attached with aria-describedby instead, so it's still announced — after the
 * name, as description, which is what it is.
 */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactElement<{ id?: string; 'aria-describedby'?: string }>;
}) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-zinc-500">
        {label}
      </label>
      {cloneElement(children, { id, 'aria-describedby': hint ? hintId : undefined })}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-zinc-600">
          {hint}
        </p>
      )}
    </div>
  );
}

const CONTROL =
  'w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 ' +
  'placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${CONTROL} resize-y ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  // min-h-11 = 44px: the spec's touch target floor on pointer:coarse. This control is the
  // reason drag isn't the only way to move a card.
  return <select {...props} className={`${CONTROL} min-h-11 ${props.className ?? ''}`} />;
}

export function Button({
  variant = 'quiet',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'quiet' | 'danger' }) {
  const styles = {
    // Green is reserved for the motivating action — create, approve, steal, send.
    primary: 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-medium',
    quiet: 'border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100',
    // Red means debt or time against you, never decoration.
    danger: 'border border-red-900/60 text-red-400 hover:border-red-700 hover:text-red-300',
  }[variant];

  return (
    <button
      {...props}
      className={`min-h-11 rounded px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${props.className ?? ''}`}
    />
  );
}

/** Plain-language error. Never a raw Firebase code, never a bare "something went wrong". */
export function ErrorNote({ children }: { children: React.ReactNode }) {
  return children ? (
    <p role="alert" className="rounded border border-red-900/60 bg-red-950/30 px-3 py-2 text-xs text-red-300">
      {children}
    </p>
  ) : null;
}
