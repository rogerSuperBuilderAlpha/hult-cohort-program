"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MessageFlag } from "@/lib/types";
import { FLAG_META, MESSAGE_FLAGS, hasFlag } from "@/lib/messageFlags";

type Props = {
  flags: MessageFlag[] | undefined;
  onToggleFlag: (flag: MessageFlag) => void;
  compact?: boolean;
};

function FlagIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`h-4 w-4 ${active ? "fill-[var(--accent)]" : "fill-none"}`}
    >
      <path
        d="M5 3.75v16.5M5 4.5h9.2l-.9 3.2H19L17.6 14H5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MessageFlagControls({
  flags,
  onToggleFlag,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasAny = (flags?.length ?? 0) > 0;

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 224;
    const gap = 6;
    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - menuWidth - 8);
    }
    let top = rect.bottom + gap;
    const estimatedHeight = 280;
    if (top + estimatedHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimatedHeight - gap);
    }
    setMenuPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onReposition() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  const menu =
    open &&
    menuPos &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        style={{ top: menuPos.top, left: menuPos.left }}
        className="fixed z-[100] w-56 rounded-xl border border-[var(--line)] bg-white p-2 shadow-[0_12px_40px_rgba(26,18,16,0.22)]"
      >
        <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          Flag message
        </p>
        <ul className="space-y-0.5">
          {MESSAGE_FLAGS.map((flag) => {
            const on = hasFlag(flags, flag);
            return (
              <li key={flag}>
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={on}
                  onClick={() => onToggleFlag(flag)}
                  className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition hover:bg-[var(--bg)] ${
                    on ? "bg-[var(--accent-soft)]" : "bg-white"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border text-[9px] ${
                      on
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--line)] bg-white"
                    }`}
                    aria-hidden
                  >
                    {on ? "✓" : ""}
                  </span>
                  <span>
                    <span className="block font-semibold text-[var(--ink)]">
                      {FLAG_META[flag].label}
                    </span>
                    <span className="text-[var(--ink-faint)]">
                      {FLAG_META[flag].hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>,
      document.body
    );

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Flag message"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Flag message"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
          open || hasAny
            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
            : "text-[var(--ink-faint)] hover:bg-[var(--bg-deep)] hover:text-[var(--accent)]"
        } ${compact ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
      >
        <FlagIcon active={hasAny || open} />
      </button>
      {menu}
    </div>
  );
}

type ChipsProps = {
  flags: MessageFlag[] | undefined;
  onToggleFlag: (flag: MessageFlag) => void;
};

const FLAG_STYLE: Record<MessageFlag, string> = {
  urgent:
    "bg-[var(--accent-soft)] text-[var(--accent-strong)] border-[var(--accent)]/30",
  important: "bg-[var(--warm-soft)] text-[#8a6a10] border-[var(--warm)]/35",
  action: "bg-[#e8f0ff] text-[#2a4a8a] border-[#8aa4d4]/40",
  unread: "bg-[var(--bg-deep)] text-[var(--ink-muted)] border-[var(--line)]",
  archived: "bg-[#eee] text-[#666] border-[#ccc]",
};

export function MessageFlagChips({ flags, onToggleFlag }: ChipsProps) {
  // Unread is shown via bold message text, not a chip.
  const active = MESSAGE_FLAGS.filter(
    (f) => f !== "unread" && hasFlag(flags, f)
  );
  if (!active.length) return null;

  return (
    <>
      {active.map((flag) => (
        <button
          key={flag}
          type="button"
          title={`Remove ${FLAG_META[flag].label}`}
          onClick={() => onToggleFlag(flag)}
          className={`rounded-full border px-1.5 py-0 text-[10px] font-medium leading-5 ${FLAG_STYLE[flag]}`}
        >
          {FLAG_META[flag].short}
        </button>
      ))}
    </>
  );
}
