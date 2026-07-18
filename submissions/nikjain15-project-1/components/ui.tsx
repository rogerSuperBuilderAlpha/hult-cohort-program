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
    // Where focus was before the dialog opened — a card, a "+" button, "New project" —
    // so it can go back there on close. Without this, closing drops focus to <body> and a
    // keyboard user is dumped at the top of the document after every create or edit.
    const opener = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Trap Tab inside the dialog. aria-modal alone does not contain focus, and the page
      // behind is still in the tab order — a keyboard user could tab out onto controls
      // they can't see. Cycle at the ends instead.
      if (e.key === 'Tab') {
        const items = focusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    // Focus moves into the dialog or a keyboard user is left behind it.
    focusable()[0]?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      // Return focus to whatever opened the dialog, if it's still on the page.
      if (opener && document.contains(opener)) opener.focus();
    };
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
      <label htmlFor={id} className="mb-1 block text-xs text-zinc-400">
        {label}
      </label>
      {cloneElement(children, { id, 'aria-describedby': hint ? hintId : undefined })}
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-zinc-400">
          {hint}
        </p>
      )}
    </div>
  );
}

// min-h-11 = 44px, the spec's touch-target floor on pointer:coarse, in the BASE so every
// control inherits it. It used to live only on Select, so Input rendered at 38px — under
// the floor on the task/project/recipe/settings forms and the recipe search. The
// placeholder-visible focus ring is here too, so no control falls back to a dark-on-dark
// border change a keyboard user can't see.
const CONTROL =
  'w-full min-h-11 rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 ' +
  'placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  // Textareas grow, so the 44px floor is a min it always clears — but keep it explicit.
  return <textarea {...props} className={`${CONTROL} resize-y ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${CONTROL} ${props.className ?? ''}`} />;
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
