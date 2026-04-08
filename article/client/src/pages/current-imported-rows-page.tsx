import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentInventory } from "../api/inventory";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { DataTable } from "../components/ui/data-table";
import { EmptyState } from "../components/ui/empty-state";
import { ImagePreview } from "../components/ui/image-preview";
import { Skeleton } from "../components/ui/skeleton";
import type { InventoryItem } from "../lib/types";

export function CurrentImportedRowsPage() {
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "image",
    "skuCode",
    "itemName",
    "shelf",
    "type",
    "quantity",
    "size",
    "color"
  ]);
  const [columnViewIndex, setColumnViewIndex] = useState(0);

  const currentInventoryQuery = useQuery({
    queryKey: ["inventory", "current"],
    queryFn: () => getCurrentInventory()
  });

  const allColumns = useMemo(
    () => [
      {
        key: "image",
        title: "Image",
        className: "w-[140px]",
        render: (row: InventoryItem) => (
          <ImagePreview
            src={row.imageUrl}
            alt={row.itemName}
            className="h-24 rounded-2xl"
            imageClassName="object-contain bg-white p-2"
          />
        )
      },
      { key: "skuCode", title: "SKU Code", render: (row: InventoryItem) => row.skuCode },
      { key: "itemName", title: "Item Name", render: (row: InventoryItem) => row.itemName },
      { key: "shelf", title: "Shelf", render: (row: InventoryItem) => row.shelf ?? "Not set" },
      { key: "type", title: "Type", render: (row: InventoryItem) => row.type ?? "Not set" },
      {
        key: "quantity",
        title: "Qty",
        render: (row: InventoryItem) => row.quantity ?? "Not set"
      },
      { key: "size", title: "Size", render: (row: InventoryItem) => row.size ?? "Not set" },
      { key: "color", title: "Color", render: (row: InventoryItem) => row.color ?? "Not set" }
    ],
    [currentInventoryQuery.data]
  );

  const columnViews = useMemo(
    () => [
      ["image", "skuCode", "itemName", "shelf"],
      ["image", "skuCode", "itemName", "type", "quantity"],
      ["image", "skuCode", "itemName", "size", "color"],
      ["image", "skuCode", "shelf", "quantity", "color"]
    ],
    []
  );

  const activeColumns = allColumns.filter((column) => visibleColumns.includes(column.key));

  const toggleColumn = (key: string) => {
    setVisibleColumns((current) => {
      if (current.includes(key)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((columnKey) => columnKey !== key);
      }

      return allColumns.filter((column) => [...current, key].includes(column.key)).map((column) => column.key);
    });
  };

  const applyColumnView = (index: number) => {
    const nextView = columnViews[index] ?? columnViews[0];
    setColumnViewIndex(index);
    setVisibleColumns(allColumns.filter((column) => nextView.includes(column.key)).map((column) => column.key));
  };

  if (currentInventoryQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const currentInventory = currentInventoryQuery.data;
  const goToNextColumnView = () => {
    const nextIndex = columnViewIndex >= columnViews.length - 1 ? 0 : columnViewIndex + 1;
    applyColumnView(nextIndex);
  };

  const goToPreviousColumnView = () => {
    const nextIndex = columnViewIndex <= 0 ? columnViews.length - 1 : columnViewIndex - 1;
    applyColumnView(nextIndex);
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Current imported rows</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Visible inventory master entries</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              Review the currently saved imported rows here. Use the Import tab when you want to replace them with a newer sheet.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge>{currentInventory?.totalRecords ?? 0} rows in database</Badge>
            {currentInventory?.latestImport ? <Badge>{currentInventory.latestImport.fileName}</Badge> : null}
            <Badge>{activeColumns.length} columns visible</Badge>
            <Badge>View {columnViewIndex + 1}</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="relative mb-4 flex flex-col gap-3 border-b border-line/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Adjust visible columns</p>
            <p className="mt-1 text-sm text-muted">Switch the visible column set here so the table stays easier to scan.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" type="button" onClick={goToPreviousColumnView}>
              Previous
            </Button>
            <Button variant="secondary" type="button" onClick={goToNextColumnView}>
              Shuffle
            </Button>
            <Button variant="secondary" type="button" onClick={() => setIsColumnMenuOpen((current) => !current)}>
              Visible columns
            </Button>
          </div>

          {isColumnMenuOpen ? (
            <div className="right-0 top-full z-20 mt-2 w-full rounded-3xl border border-line bg-white/95 p-4 shadow-soft backdrop-blur sm:absolute sm:w-[320px]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Choose columns</p>
                <button
                  type="button"
                  className="text-sm font-medium text-muted transition hover:text-ink"
                  onClick={() => setIsColumnMenuOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="grid gap-2">
                {allColumns.map((column) => {
                  const isChecked = visibleColumns.includes(column.key);
                  const isLastVisible = isChecked && visibleColumns.length === 1;

                  return (
                    <label
                      key={column.key}
                      className="flex items-center justify-between rounded-2xl border border-line/70 px-3 py-2 text-sm text-ink transition hover:border-brand-100 hover:bg-brand-50/40"
                    >
                      <span>{column.title}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isLastVisible}
                        onChange={() => toggleColumn(column.key)}
                        className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <DataTable
          rows={currentInventory?.sampleRows ?? []}
          empty={<EmptyState title="No rows available" description="Import a workbook to populate the inventory master." />}
          columns={activeColumns}
        />
        <div className="mt-4 flex flex-col gap-2 border-t border-line/70 pt-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Active column view {columnViewIndex + 1} of {columnViews.length}</p>
          <p>Use Shuffle to rotate visible columns, or open Visible columns for manual control.</p>
        </div>
      </Card>
    </div>
  );
}
