import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Database, Upload } from "lucide-react";
import { toast } from "sonner";
import { commitImport, getCurrentInventory, previewImport, searchInventory } from "../api/inventory";
import { queryClient } from "../app/query-client";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { DataTable } from "../components/ui/data-table";
import { DetailCard } from "../components/ui/detail-card";
import { EmptyState } from "../components/ui/empty-state";
import { FileDropzone } from "../components/ui/file-dropzone";
import { ImagePreview } from "../components/ui/image-preview";
import { InventoryResultsTable } from "../components/ui/inventory-results-table";
import { SearchBar } from "../components/ui/search-bar";
import { Select } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import type { ImportPreview } from "../lib/types";

export function InventoryImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sku, setSku] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [lastImportSummary, setLastImportSummary] = useState<ImportPreview | null>(null);
  const resultPanelRef = useRef<HTMLDivElement | null>(null);

  const currentInventoryQuery = useQuery({
    queryKey: ["inventory", "current"],
    queryFn: () => getCurrentInventory()
  });

  useEffect(() => {
    if (currentInventoryQuery.data) {
      setShowUploadPanel(!currentInventoryQuery.data.hasInventory);
    }
  }, [currentInventoryQuery.data]);

  const importWorkbookMutation = useMutation({
    mutationFn: async (selectedFile: File) => {
      const preview = await previewImport(selectedFile);
      await commitImport(preview);
      return preview;
    },
    onSuccess: async (preview) => {
      setLastImportSummary(preview);
      toast.success("Import successful. Enter the SKU code to continue.");
      setFile(null);
      setSku("");
      setSelectedItemId("");
      setShowUploadPanel(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory", "current"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "import-history"] })
      ]);
    }
  });

  const searchMutation = useMutation({
    mutationFn: searchInventory,
    onError: () => toast.error("SKU lookup failed. Please try again.")
  });

  const searchItems = useMemo(
    () =>
      [...(searchMutation.data?.items ?? [])].sort((a, b) => {
        const shelfCompare = (a.shelf ?? "").localeCompare(b.shelf ?? "", undefined, {
          numeric: true,
          sensitivity: "base"
        });
        if (shelfCompare !== 0) return shelfCompare;

        const colorCompare = (a.color ?? "").localeCompare(b.color ?? "", undefined, {
          sensitivity: "base"
        });
        if (colorCompare !== 0) return colorCompare;

        const sizeCompare = (a.size ?? "").localeCompare(b.size ?? "", undefined, {
          numeric: true,
          sensitivity: "base"
        });
        if (sizeCompare !== 0) return sizeCompare;

        return (a.quantity ?? 0) - (b.quantity ?? 0);
      }),
    [searchMutation.data?.items]
  );

  useEffect(() => {
    if (!searchItems.length) {
      setSelectedItemId("");
      return;
    }

    setSelectedItemId((current) => (current && searchItems.some((item) => item.id === current) ? current : searchItems[0].id));
  }, [searchItems]);

  const hasDuplicates = searchItems.length > 1;
  const selectedItem = useMemo(
    () => searchItems.find((item) => item.id === selectedItemId) ?? searchItems[0] ?? null,
    [searchItems, selectedItemId]
  );
  const batchOptions = useMemo(
    () =>
      searchItems.map((item, index) => ({
        value: item.id,
        label: `Batch ${index + 1} - ${item.shelf ?? "No shelf"} - ${item.color ?? "No color"} - Qty ${item.quantity ?? 0}`
      })),
    [searchItems]
  );

  useEffect(() => {
    if (selectedItem && resultPanelRef.current) {
      resultPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedItem]);

  function searchNextSku() {
    setSku("");
    setSelectedItemId("");
    searchMutation.reset();
  }

  function finishLookup() {
    setSku("");
    setSelectedItemId("");
    searchMutation.reset();
  }

  function handleSearchSubmit() {
    setShowUploadPanel(false);
    searchMutation.mutate(sku);
  }

  const currentInventory = currentInventoryQuery.data;

  return (
    <div className="space-y-5">
      <section>
        <Card className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              <Badge className="border-brand-100 bg-brand-50 text-brand-600">
                <Database className="mr-1 h-3.5 w-3.5" />
                {currentInventory?.totalRecords ?? 0} records saved
              </Badge>
              {currentInventory?.latestImport ? (
                <>
                  <Badge>{currentInventory.latestImport.fileName}</Badge>
                  <Badge>{currentInventory.latestImport.rowsImported} Excel rows</Badge>
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setShowUploadPanel((value) => !value)}>
                <Upload className="h-4 w-4" />
                {showUploadPanel ? "Hide upload" : currentInventory?.hasInventory ? "Replace import" : "Import workbook"}
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <SearchBar value={sku} onChange={setSku} onSubmit={handleSearchSubmit} loading={searchMutation.isPending} />
          </div>
        </Card>
      </section>

      {searchMutation.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-[460px]" />
        </div>
      ) : null}

      {searchMutation.data ? (
        <div ref={resultPanelRef}>
          <Card className="p-4">
            {!searchItems.length ? (
              <EmptyState title="No record found" description="No inventory rows matched that SKU code in the saved master." />
            ) : (
              <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Match selection</p>
                  <h4 className="mt-2 font-display text-xl text-ink">Choose the exact batch</h4>

                  {hasDuplicates ? (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-semibold text-ink">Available batches</label>
                      <Select value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}>
                        {batchOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <InventoryResultsTable
                      items={selectedItem ? [selectedItem] : []}
                      emptyTitle="No record selected"
                      emptyDescription="Select a batch to view the item."
                    />
                  </div>
                </Card>

                {selectedItem ? (
                  <DetailCard key={selectedItem.id} item={selectedItem} siblings={searchItems.length} />
                ) : (
                  <EmptyState title="Select a batch" description="Pick a batch from the dropdown to show the larger image and item details." />
                )}
              </div>
            )}

            {searchItems.length ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={searchNextSku}>
                  <ArrowRight className="h-4 w-4" />
                  Search next SKU
                </Button>
                <Button onClick={finishLookup}>Finish</Button>
              </div>
            ) : null}
          </Card>
        </div>
      ) : null}

      {showUploadPanel ? (
        <Card className="p-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Upload workbook</p>
              <h3 className="mt-2 font-display text-3xl text-ink">Replace the saved inventory master</h3>
              <div className="mt-5">
                <FileDropzone file={file} onChange={setFile} />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={() => file && importWorkbookMutation.mutate(file)} disabled={!file || importWorkbookMutation.isPending}>
                  {importWorkbookMutation.isPending ? "Importing..." : "Import workbook"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFile(null);
                    setLastImportSummary(null);
                  }}
                  disabled={!file && !lastImportSummary}
                >
                  Upload another file
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {lastImportSummary ? (
                <>
                  <div className="flex flex-wrap gap-3">
                    <Badge>{lastImportSummary.fileName}</Badge>
                    <Badge className="border-brand-100 bg-brand-50 text-brand-600">
                      {lastImportSummary.rowCount} valid rows
                    </Badge>
                    <Badge className={lastImportSummary.failedRows ? "text-danger" : ""}>
                      {lastImportSummary.failedRows} skipped
                    </Badge>
                  </div>
                  <DataTable
                    rows={lastImportSummary.sampleRows}
                    empty={<EmptyState title="No preview rows" description="The uploaded file did not contain usable inventory rows." />}
                    columns={[
                      {
                        key: "image",
                        title: "Image",
                        className: "w-[140px]",
                        render: (row) => (
                          <ImagePreview
                            src={row.imageUrl}
                            alt={row.itemName}
                            className="h-24 rounded-2xl"
                            imageClassName="object-contain bg-white p-2"
                          />
                        )
                      },
                      { key: "skuCode", title: "SKU", render: (row) => row.skuCode },
                      { key: "itemName", title: "Item Name", render: (row) => row.itemName },
                      { key: "shelf", title: "Shelf", render: (row) => row.shelf ?? "Not set" },
                      { key: "type", title: "Type", render: (row) => row.type ?? "Not set" },
                      { key: "quantity", title: "Qty", render: (row) => row.quantity ?? "Not set" }
                    ]}
                  />
                </>
              ) : (
                <div className="rounded-3xl border border-line bg-white/72 p-5">
                  <p className="text-sm font-semibold text-ink">Upload once, then continue working.</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Importing now validates and saves the workbook in one step, then you can search the SKU immediately.
                  </p>
                </div>
              )}
            </div>
          </div>

          {lastImportSummary?.errors.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {lastImportSummary.errors.map((error) => (
                <div key={`${error.row}-${error.message}`} className="rounded-2xl border border-line bg-white/75 px-4 py-3">
                  <p className="font-semibold text-ink">Row {error.row}</p>
                  <p className="mt-1 text-sm text-muted">{error.message}</p>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      ) : null}

    </div>
  );
}
