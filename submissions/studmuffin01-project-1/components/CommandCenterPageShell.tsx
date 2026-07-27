"use client";

import PageShell from "@/components/PageShell";
import { CommandCenterMobileProvider } from "@/hooks/CommandCenterMobileProvider";

interface CommandCenterPageShellProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Page shell with shared Command Center mobile drawer state for header + sidebar row. */
export default function CommandCenterPageShell({
  header,
  footer,
  children,
}: CommandCenterPageShellProps) {
  return (
    <CommandCenterMobileProvider>
      <PageShell header={header} footer={footer}>
        {children}
      </PageShell>
    </CommandCenterMobileProvider>
  );
}
