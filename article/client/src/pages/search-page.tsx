import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { searchInventory } from "../api/inventory";
import { EmptyState } from "../components/ui/empty-state";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { InventoryResultsTable } from "../components/ui/inventory-results-table";
import { SearchBar } from "../components/ui/search-bar";
import { Skeleton } from "../components/ui/skeleton";

export function SearchPage() {
  const [sku, setSku] = useState("");

  const searchMutation = useMutation({
    mutationFn: searchInventory,
    onError: () => {
      toast.error("Search failed. Please try again.");
    }
  });

  const items = searchMutation.data?.items ?? [];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="section-title">SKU lookup</h2>
        <p className="section-subtitle">
          Search the current inventory master by SKU code and review item details in a clean, readable layout.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="panel-grid bg-mesh-fade p-6">
          <Badge className="border-brand-100 bg-brand-50 text-brand-600">Fast exact-match lookup</Badge>
          <h3 className="mt-4 font-display text-4xl text-ink">Find product details in seconds.</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Search by SKU code to pull item identity, shelf location, quantity, attributes, and visual reference from the active inventory master.
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Search guidance</p>
          <div className="mt-4 grid gap-3">
            {["Use the exact SKU when possible.", "Matching rows return as premium detail cards.", "Image fallbacks keep the page stable if URLs fail."].map((line) => (
              <div key={line} className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-ink">
                {line}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <SearchBar
        value={sku}
        onChange={setSku}
        onSubmit={() => searchMutation.mutate(sku)}
        loading={searchMutation.isPending}
      />

      {searchMutation.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-[480px]" />
        </div>
      ) : null}

      {searchMutation.isSuccess && !items.length ? (
        <EmptyState
          title="No record found"
          description="No inventory rows matched that SKU code. Check the formatting or try another value from the latest inventory sheet."
        />
      ) : null}

      {items.length ? (
        <div className="space-y-6">
          <div className="surface panel-grid px-5 py-4 text-sm text-muted">
            Found <span className="font-semibold text-ink">{items.length}</span> matching record{items.length > 1 ? "s" : ""} for{" "}
            <span className="font-semibold text-ink">{searchMutation.data?.query}</span>.
          </div>
          <InventoryResultsTable
            items={items}
            emptyTitle="No matching inventory"
            emptyDescription="No rows matched that SKU code."
          />
        </div>
      ) : null}
    </div>
  );
}
