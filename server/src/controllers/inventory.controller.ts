import type { Request, Response } from "express";
import { z } from "zod";
import { createAuditLog } from "../services/audit.service.js";
import { commitInventoryImport, previewInventoryImport } from "../services/import.service.js";
import { getCurrentInventorySnapshot, searchInventory } from "../services/inventory.service.js";
import { fail, success } from "../utils/response.js";

const searchSchema = z.object({
  sku: z.string().min(1)
});

const currentInventorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

const commitSchema = z.object({
  previewToken: z.string().min(1).optional(),
  fileName: z.string().min(1).optional(),
  rows: z
    .array(
      z.object({
        skuCode: z.string().min(1),
        itemName: z.string().min(1),
        shelf: z.string().nullable(),
        type: z.string().nullable(),
        quantity: z.number().nullable(),
        size: z.string().nullable(),
        color: z.string().nullable(),
        imageUrl: z.string().nullable()
      })
    )
    .optional(),
  errors: z
    .array(
      z.object({
        row: z.number(),
        message: z.string()
      })
    )
    .optional()
});

export async function searchItems(req: Request, res: Response) {
  const payload = searchSchema.parse(req.query);
  const result = await searchInventory(payload.sku);
  res.json(success(result));
}

export async function getCurrentInventory(req: Request, res: Response) {
  const payload = currentInventorySchema.parse(req.query);
  const result = await getCurrentInventorySnapshot(payload.page, payload.limit);
  res.json(success(result));
}

export async function previewImport(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json(fail("Excel file is required"));
    return;
  }

  const preview = await previewInventoryImport(req.file.path, req.file.originalname);

  await createAuditLog({
    actorId: req.user!.id,
    action: "PREVIEW_IMPORT",
    entityType: "IMPORT",
    description: `Previewed import file ${req.file.originalname}`,
    metadata: { rows: preview.rowCount, failedRows: preview.failedRows }
  });

  res.json(success(preview, "Import preview generated"));
}

export async function importAndCommit(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json(fail("Excel file is required"));
    return;
  }

  const preview = await previewInventoryImport(req.file.path, req.file.originalname);
  const result = await commitInventoryImport(
    {
      fileName: preview.fileName,
      rows: preview.rows,
      errors: preview.errors
    },
    req.user!.id
  );

  await createAuditLog({
    actorId: req.user!.id,
    action: "IMPORT_WORKBOOK",
    entityType: "IMPORT",
    entityId: result.importLog.id,
    description: `Imported workbook ${preview.fileName}`,
    metadata: {
      rowsImported: result.rowsImported,
      failedRows: result.failedRows.length
    }
  });

  res.json(
    success(
      {
        ...preview,
        importLog: result.importLog,
        rowsImported: result.rowsImported
      },
      "Inventory imported successfully"
    )
  );
}

export async function commitImport(req: Request, res: Response) {
  const payload = commitSchema.parse(req.body);
  const result = await commitInventoryImport(
    payload.previewToken
      ? { previewToken: payload.previewToken }
      : {
          fileName: payload.fileName ?? "inventory.xlsx",
          rows: payload.rows ?? [],
          errors: payload.errors ?? []
        },
    req.user!.id
  );

  await createAuditLog({
    actorId: req.user!.id,
    action: "COMMIT_IMPORT",
    entityType: "IMPORT",
    entityId: result.importLog.id,
    description: `Committed import ${result.importLog.fileName}`,
    metadata: {
      rowsImported: result.rowsImported,
      failedRows: result.failedRows.length
    }
  });

  res.json(success(result, "Inventory replaced successfully"));
}
