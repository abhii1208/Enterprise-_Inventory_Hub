import { prisma } from "../config/prisma.js";
import { normalizeSku } from "../utils/normalize.js";

export async function searchInventory(skuCode: string) {
  const normalized = normalizeSku(skuCode);
  const records = await prisma.inventoryItem.findMany({
    where: {
      skuCodeNormalized: {
        equals: normalized
      }
    },
    orderBy: [{ skuCode: "asc" }, { itemName: "asc" }, { shelf: "asc" }]
  });

  return {
    query: skuCode.trim(),
    total: records.length,
    items: records
  };
}

export async function getCurrentInventorySnapshot(page = 1, limit = 12) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 50);
  const skip = (safePage - 1) * safeLimit;

  const [latestImport, totalRecords, sampleRows] = await Promise.all([
    prisma.importLog.findFirst({
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
    }),
    prisma.inventoryItem.count(),
    prisma.inventoryItem.findMany({
      orderBy: [{ skuCode: "asc" }, { itemName: "asc" }, { shelf: "asc" }],
      skip,
      take: safeLimit
    })
  ]);

  return {
    hasInventory: totalRecords > 0,
    totalRecords,
    page: safePage,
    pageSize: safeLimit,
    totalPages: Math.max(1, Math.ceil(totalRecords / safeLimit)),
    latestImport,
    sampleRows
  };
}
