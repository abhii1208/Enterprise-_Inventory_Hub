import { Search } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export function SearchBar({ value, onChange, onSubmit, loading }: SearchBarProps) {
  return (
    <div className="surface panel-grid tilt-sheen relative overflow-hidden p-3 sm:p-4">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSubmit();
              }
            }}
            className="h-14 border-0 bg-white/95 pl-12 text-base shadow-inner"
            placeholder="Enter SKU code to search inventory"
          />
        </div>
        <Button className="h-14 px-6" onClick={onSubmit} disabled={!value.trim() || loading}>
          {loading ? "Searching..." : "Search SKU"}
        </Button>
      </div>
    </div>
  );
}
