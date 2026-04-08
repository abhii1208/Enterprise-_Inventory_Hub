import { prisma } from "../config/prisma.js";

export async function getAdminDashboardMetrics() {
  const [totalUsers, activeUsers, totalInventoryRecords, latestImport] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.inventoryItem.count(),
    prisma.importLog.findFirst({
      orderBy: { uploadedAt: "desc" },
      select: { uploadedAt: true }
    })
  ]);

  return {
    totalUsers,
    activeUsers,
    totalInventoryRecords,
    lastUploadDate: latestImport?.uploadedAt ?? null
  };
}

