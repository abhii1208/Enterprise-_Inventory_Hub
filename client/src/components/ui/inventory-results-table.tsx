import type { InventoryItem } from "../../lib/types";
import { DataTable } from "./data-table";
import { EmptyState } from "./empty-state";
import { ImagePreview } from "./image-preview";

type InventoryResultsTableProps = {
  items: InventoryItem[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function InventoryResultsTable({
  items,
  emptyTitle = "No matching inventory",
  emptyDescription = "No rows matched that SKU code."
}: InventoryResultsTableProps) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="surface rounded-3xl p-4">
            <div className="flex gap-3">
              <ImagePreview
                src={item.imageUrl}
                alt={item.itemName}
                className="h-24 w-24 shrink-0 rounded-2xl border border-line bg-white"
                imageClassName="object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">SKU Code</p>
                <p className="mt-1 break-words font-semibold text-ink">{item.skuCode}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Item Name</p>
                <p className="mt-1 break-words font-semibold text-ink">{item.itemName}</p>
                <p className="mt-1 text-xs text-muted">{item.type ?? "Unspecified type"}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line bg-white/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Shelf</p>
                <p className="mt-1 text-sm font-semibold text-ink">{item.shelf ?? "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Qty</p>
                <p className="mt-1 text-sm font-semibold text-ink">{item.quantity ?? "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Size</p>
                <p className="mt-1 text-sm font-semibold text-ink">{item.size ?? "Not set"}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Color</p>
                <p className="mt-1 text-sm font-semibold text-ink">{item.color ?? "Not set"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <DataTable
          rows={items}
          empty={<EmptyState title={emptyTitle} description={emptyDescription} />}
          columns={[
            {
              key: "image",
              title: "Image",
              className: "min-w-[172px]",
              render: (item) => (
                <ImagePreview
                  src={item.imageUrl}
                  alt={item.itemName}
                  className="h-28 w-36 rounded-2xl border border-line bg-white"
                  imageClassName="object-cover"
                />
              )
            },
            {
              key: "skuCode",
              title: "SKU Code",
              render: (item) => <span className="font-semibold text-ink">{item.skuCode}</span>
            },
            {
              key: "itemName",
              title: "Item Name",
              className: "min-w-[220px]",
              render: (item) => (
                <div>
                  <p className="font-semibold text-ink">{item.itemName}</p>
                  <p className="mt-1 text-xs text-muted">{item.type ?? "Unspecified type"}</p>
                </div>
              )
            },
            {
              key: "shelf",
              title: "Shelf",
              render: (item) => item.shelf ?? "Not set"
            },
            {
              key: "quantity",
              title: "Qty",
              render: (item) => item.quantity ?? "Not set"
            },
            {
              key: "size",
              title: "Size",
              render: (item) => item.size ?? "Not set"
            },
            {
              key: "color",
              title: "Color",
              render: (item) => item.color ?? "Not set"
            }
          ]}
        />
      </div>
    </>
  );
}
