import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

type Column<T> = {
  key: string;
  title: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  empty: ReactNode;
};

export function DataTable<T>({ columns, rows, empty }: DataTableProps<T>) {
  if (!rows.length) {
    return <>{empty}</>;
  }

  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-line bg-white/70">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted",
                    column.className
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-line/70 transition duration-200 hover:bg-white/65 hover:shadow-inner">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-5 py-4 align-top text-sm text-ink", column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
