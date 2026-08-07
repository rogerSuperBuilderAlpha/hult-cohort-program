"use client";

import { useEffect, useRef, useState } from "react";
import { getInitiativeAnchorId, type Initiative } from "@/lib/initiatives";
import { scrollToSection } from "@/lib/scroll";

function buildDestinations(initiatives: Initiative[]) {
  return [
    { id: "top", label: "Top" },
    ...initiatives.map((initiative) => ({
      id: getInitiativeAnchorId(initiative.slug),
      label: initiative.title,
    })),
  ];
}

interface GoToNavProps {
  initiatives: Initiative[];
  menuIdSuffix?: string;
}

export default function GoToNav({ initiatives, menuIdSuffix = "main" }: GoToNavProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = `go-to-menu-${menuIdSuffix}`;
  const destinations = buildDestinations(initiatives);

  const scrollTo = (id: string) => {
    scrollToSection(id);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <nav aria-label="Go to page section" className="flex justify-end pt-4">
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-bg"
        >
          Go To
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <ul
            id={menuId}
            role="menu"
            aria-label="Go to destinations"
            className="absolute bottom-full right-0 z-10 mb-2 w-96 rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-200 dark:border-surface-border dark:bg-surface-card dark:ring-surface-border"
          >
            {destinations.map((item) => (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => scrollTo(item.id)}
                  className="w-full px-4 py-2 text-left text-sm leading-snug text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-surface-secondary dark:hover:bg-surface-bg dark:hover:text-surface-primary"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}

