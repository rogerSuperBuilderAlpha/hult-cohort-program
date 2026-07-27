import { dashboardShellClassName } from "@/lib/dashboardStyles";

interface PageShellProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageShell({ header, footer, children }: PageShellProps) {
  return (
    <div className={dashboardShellClassName}>
      {header}
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
        {footer}
      </div>
    </div>
  );
}

/** Spacer matching Command Center width so content below aligns with the main column. */
export function CommandCenterSpacer() {
  return <div className="w-64 shrink-0" aria-hidden="true" />;
}
