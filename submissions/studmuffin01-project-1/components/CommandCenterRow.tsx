"use client";

import { useEffect, useRef, useState } from "react";
import AppSidebar from "@/components/AppSidebar";

interface CommandCenterRowProps {
  children: React.ReactNode;
}

/** Command Center panel beside content; tall enough to show all items without scrolling. */
export default function CommandCenterRow({ children }: CommandCenterRowProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const [rowHeight, setRowHeight] = useState<number>();

  useEffect(() => {
    const contentElement = contentRef.current;
    const sidebarElement = sidebarRef.current;
    if (!contentElement || !sidebarElement) return;

    const updateHeight = () => {
      const contentHeight = contentElement.getBoundingClientRect().height;
      const sidebarHeight = sidebarElement.scrollHeight;
      setRowHeight(Math.max(contentHeight, sidebarHeight));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(contentElement);
    observer.observe(sidebarElement);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex items-start pt-8">
      <div
        className="shrink-0"
        style={rowHeight !== undefined ? { height: rowHeight } : undefined}
      >
        <AppSidebar ref={sidebarRef} className="h-full" />
      </div>
      <div ref={contentRef} className="min-w-0 flex-1">
        {children}
      </div>
    </div>
  );
}
