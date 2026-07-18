interface PageShellProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageShell({ header, footer, children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100 dark:bg-surface-bg">
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
