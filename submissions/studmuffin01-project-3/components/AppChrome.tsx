"use client";

import { usePathname } from "next/navigation";
import { LiveSummary } from "@/components/LiveSummary";
import { getLiveMetrics } from "@/lib/metrics";

const AUTH_PREFIXES = ["/signin", "/auth"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth =
    pathname === "/" ||
    AUTH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  const metrics = getLiveMetrics();

  return (
    <div className="min-h-full">
      {!isAuth ? <LiveSummary metrics={metrics} /> : null}
      <div className={isAuth ? "min-h-full" : "min-h-full lg:pl-[10.5rem]"}>
        {children}
      </div>
    </div>
  );
}
