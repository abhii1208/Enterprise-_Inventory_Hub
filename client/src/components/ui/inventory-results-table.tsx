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
  return (
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
  );
}
