import { Badge } from "./badge";
import { Card } from "./card";
import { ImagePreview } from "./image-preview";
import type { InventoryItem } from "../../lib/types";

type DetailCardProps = {
  item: InventoryItem;
  siblings?: number;
};

const fields = [
  { label: "SKU Code", key: "skuCode" },
  { label: "Item Name", key: "itemName" },
  { label: "Shelf", key: "shelf" },
  { label: "Type", key: "type" },
  { label: "Quantity", key: "quantity" },
  { label: "Size", key: "size" },
  { label: "Color", key: "color" }
] as const;

export function DetailCard({ item, siblings = 1 }: DetailCardProps) {
  return (
    <Card className="tilt-sheen overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-grid bg-mesh-fade p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Badge>{siblings > 1 ? `${siblings} related records` : "Inventory detail"}</Badge>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">{item.skuCode}</p>
          </div>
          <h2 className="font-display text-2xl leading-tight text-ink sm:text-3xl">{item.itemName}</h2>
          <div className="mt-5">
            <ImagePreview
              src={item.imageUrl}
              alt={item.itemName}
              className="h-[260px] w-full border border-white/60 bg-white shadow-soft sm:h-[440px]"
              imageClassName="object-contain bg-white"
            />
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className="rounded-2xl border border-line bg-white/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{field.label}</p>
                <p className="mt-1.5 text-sm font-semibold text-ink sm:text-base">
                  {item[field.key] === null || item[field.key] === "" ? "Not available" : String(item[field.key])}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
