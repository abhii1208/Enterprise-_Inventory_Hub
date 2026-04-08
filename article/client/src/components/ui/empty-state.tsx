import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      <div className="rounded-full bg-brand-50 p-4">
        <div className="h-10 w-10 rounded-full bg-brand-100" />
      </div>
      <div>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

