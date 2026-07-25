"use client";

import { useEffect, useRef, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useCommandCenterMobile } from "@/hooks/CommandCenterMobileProvider";
import { SidebarDataProvider } from "@/hooks/SidebarDataProvider";
import { COMMAND_CENTER_SIDEBAR_WIDTH_CLASS } from "@/lib/dashboardStyles";

interface CommandCenterRowProps {
  children: React.ReactNode;
}

/** Command Center beside content; collapsible drawer on narrow viewports. */
export default function CommandCenterRow({ children }: CommandCenterRowProps) {
  const mobileContext = useCommandCenterMobile();
  const mobileOpen = mobileContext?.mobileOpen ?? false;
  const setMobileOpen = mobileContext?.setMobileOpen;

  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [rowHeight, setRowHeight] = useState<number>();

  useEffect(() => {
    const contentElement = contentRef.current;
    const sidebarElement = sidebarRef.current;
    if (!contentElement || !sidebarElement) {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateHeight = () => {
      if (!mediaQuery.matches) {
        setRowHeight(undefined);
        return;
      }

      const contentHeight = contentElement.getBoundingClientRect().height;
      const sidebarHeight = sidebarElement.scrollHeight;
      setRowHeight(Math.max(contentHeight, sidebarHeight));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(contentElement);
    observer.observe(sidebarElement);
    mediaQuery.addEventListener("change", updateHeight);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateHeight);
    };
  }, []);

  return (
    <SidebarDataProvider>
      <div className="relative flex flex-col items-start pt-4 lg:flex-row lg:pt-6">
        {mobileOpen && setMobileOpen && (
          <button
            type="button"
            aria-label="Close Command Center"
            className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[1px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className={`${COMMAND_CENTER_SIDEBAR_WIDTH_CLASS} shrink-0 transition-transform duration-200 ease-out lg:relative lg:translate-x-0 ${
            mobileOpen
              ? "fixed inset-y-0 left-0 z-40 translate-x-0"
              : "pointer-events-none fixed inset-y-0 left-0 z-40 -translate-x-full lg:pointer-events-auto lg:static lg:z-auto"
          }`}
          style={rowHeight !== undefined ? { height: rowHeight } : undefined}
        >
          <AppSidebar
            ref={sidebarRef}
            id="command-center-sidebar"
            className="h-full max-h-[100dvh] overflow-y-auto lg:max-h-none"
            onMobileClose={setMobileOpen ? () => setMobileOpen(false) : undefined}
          />
        </div>

        <div ref={contentRef} className="min-w-0 w-full flex-1">
          {children}
        </div>
      </div>
    </SidebarDataProvider>
  );
}
