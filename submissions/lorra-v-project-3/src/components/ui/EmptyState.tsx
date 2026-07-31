import { type ReactNode } from "react";
import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-4 border-dashed">
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="max-w-md text-sm leading-relaxed text-foreground-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </Card>
  );
}
