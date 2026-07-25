"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getInitiativeAnchorId } from "@/lib/initiatives";
import { scrollToSection } from "@/lib/scroll";

interface ScrollToInitiativeOnLoadProps {
  ready: boolean;
}

/** Scrolls to an initiative section when `?initiative=<slug>` is present, then clears the query. */
export default function ScrollToInitiativeOnLoad({ ready }: ScrollToInitiativeOnLoadProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ready) {
      return;
    }

    const slug = searchParams.get("initiative")?.trim();
    if (!slug) {
      return;
    }

    const timer = window.setTimeout(() => {
      scrollToSection(getInitiativeAnchorId(slug));
      window.history.replaceState(null, "", "/");
    }, 150);

    return () => window.clearTimeout(timer);
  }, [ready, searchParams]);

  return null;
}
