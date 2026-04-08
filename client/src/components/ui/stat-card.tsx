import type { ReactNode } from "react";
import { Card } from "./card";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
};

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
          <p className="mt-3 font-display text-4xl text-ink">{value}</p>
          {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
        </div>
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-600">{icon}</div>
      </div>
    </Card>
  );
}

