"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { commandCenterHeaderToggleClassName } from "@/lib/dashboardStyles";

interface CommandCenterMobileContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
}

const CommandCenterMobileContext = createContext<CommandCenterMobileContextValue | null>(null);

export function CommandCenterMobileProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (mediaQuery.matches) {
        setMobileOpen(false);
      }
    };

    mediaQuery.addEventListener("change", closeOnDesktop);
    return () => mediaQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <CommandCenterMobileContext.Provider value={{ mobileOpen, setMobileOpen, toggleMobile }}>
      {children}
    </CommandCenterMobileContext.Provider>
  );
}

export function useCommandCenterMobile() {
  return useContext(CommandCenterMobileContext);
}

export function CommandCenterMobileToggle() {
  const context = useCommandCenterMobile();

  if (!context) {
    return null;
  }

  const { mobileOpen, toggleMobile } = context;

  return (
    <button
      type="button"
      aria-expanded={mobileOpen}
      aria-controls="command-center-sidebar"
      aria-label={mobileOpen ? "Close Command Center" : "Open Command Center"}
      onClick={toggleMobile}
      className={commandCenterHeaderToggleClassName}
    >
      <CommandCenterMenuIcon open={mobileOpen} />
      <span className="hidden sm:inline">{mobileOpen ? "Close" : "Command Center"}</span>
    </button>
  );
}

function CommandCenterMenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}
