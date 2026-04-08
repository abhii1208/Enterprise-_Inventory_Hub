import fs from "node:fs/promises";
import path from "node:path";
import createHttpError from "http-errors";
import { nanoid } from "nanoid";
import xlsx from "xlsx";
import { prisma } from "../config/prisma.js";
import { cleanText, normalizeSku, toOptionalText } from "../utils/normalize.js";

const REQUIRED_HEADERS = ["Sku Code", "Item Name", "Shelf", "Type", "Qty", "Size", "Color", "Image"];
const tempDir = path.resolve(process.cwd(), "temp");

type PreviewRow = {
  skuCode: string;
  itemName: string;
  shelf: string | null;
  type: string | null;
  quantity: number | null;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
};

type PreviewError = {
  row: number;
  message: string;
};

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeHeaders(headers: string[]) {
  return headers.map((header) => header.trim());
}

export async function previewInventoryImport(filePath: string, fileName: string) {
  const workbook = xlsx.readFile(filePath);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) {
    throw createHttpError(400, "The workbook does not contain any sheets");
  }

  const sheetRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
    defval: "",
    raw: false
  });
  const headers = normalizeHeaders(
    xlsx.utils.sheet_to_json<string[]>(firstSheet, { header: 1, range: 0 })[0] ?? []
  );

  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    throw createHttpError(400, `Missing required headers: ${missingHeaders.join(", ")}`);
  }

  const validRows: PreviewRow[] = [];
  const errors: PreviewError[] = [];

  sheetRows.forEach((row, index) => {
    const rowNumber = index + 2;
    const skuCode = cleanText(row["Sku Code"]);
    const itemName = cleanText(row["Item Name"]);
    const shelf = toOptionalText(row["Shelf"]);
    const type = toOptionalText(row["Type"]);
    const qtyValue = cleanText(row["Qty"]);
    const size = toOptionalText(row["Size"]);
    const color = toOptionalText(row["Color"]);
    const imageUrl = toOptionalText(row["Image"]);

    const isBlank = !skuCode && !itemName && !shelf && !type && !qtyValue && !size && !color && !imageUrl;
    if (isBlank) {
      return;
    }

    if (!skuCode || !itemName) {
      errors.push({
        row: rowNumber,
        message: "Sku Code and Item Name are required"
      });
      return;
    }

    let quantity: number | null = null;
    if (qtyValue) {
      quantity = Number(qtyValue);
      if (!Number.isFinite(quantity) || quantity < 0) {
        errors.push({
          row: rowNumber,
          message: "Qty must be a non-negative number"
        });
        return;
      }
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      errors.push({
        row: rowNumber,
        message: "Image must be a valid http or https URL"
      });
      return;
    }

    validRows.push({
      skuCode,
      itemName,
      shelf,
      type,
      quantity,
      size,
      color,
      imageUrl
    });
  });

  if (!validRows.length) {
    throw createHttpError(400, "No valid inventory rows were found in the file");
  }

  const previewToken = nanoid(16);
  const previewPath = path.join(tempDir, `${previewToken}.json`);
  await fs.writeFile(
    previewPath,
    JSON.stringify({
      fileName,
      previewToken,
      createdAt: new Date().toISOString(),
      rows: validRows,
      errors
    }),
    "utf8"
  );

  return {
    previewToken,
    fileName,
    rowCount: validRows.length,
    failedRows: errors.length,
    sampleRows: validRows.slice(0, 8),
    errors
  };
}

export async function commitInventoryImport(previewToken: string, uploadedById: string) {
  const previewPath = path.join(tempDir, `${previewToken}.json`);
  let payload: { fileName: string; rows: PreviewRow[]; errors: PreviewError[] };

  try {
    const raw = await fs.readFile(previewPath, "utf8");
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    throw createHttpError(404, "Import preview session not found or expired");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.inventoryItem.deleteMany();

    const importLog = await tx.importLog.create({
      data: {
        fileName: payload.fileName,
        uploadedById,
        rowsImported: payload.rows.length,
        failedRows: payload.errors.length,
        status: "COMPLETED",
        summary: payload.errors.length
          ? `Imported with ${payload.errors.length} skipped rows`
          : "Imported successfully"
      }
    });

    if (payload.rows.length) {
      await tx.inventoryItem.createMany({
        data: payload.rows.map((row) => ({
          skuCode: row.skuCode,
          skuCodeNormalized: normalizeSku(row.skuCode),
          itemName: row.itemName,
          shelf: row.shelf,
          type: row.type,
          quantity: row.quantity,
          size: row.size,
          color: row.color,
          imageUrl: row.imageUrl,
          importLogId: importLog.id
        }))
      });
    }

    return importLog;
  });

  await fs.unlink(previewPath).catch(() => undefined);

  return {
    importLog: result,
    failedRows: payload.errors,
    rowsImported: payload.rows.length
  };
}

export async function listImportLogs() {
  return prisma.importLog.findMany({
    orderBy: { uploadedAt: "desc" },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
}

export async function clearImportLogs() {
  const result = await prisma.importLog.deleteMany();
  return {
    deletedCount: result.count
  };
}
