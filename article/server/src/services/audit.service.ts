import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      description: input.description,
      metadata: input.metadata as Prisma.InputJsonValue | undefined
    }
  });
}

export async function clearAuditLogs() {
  const result = await prisma.auditLog.deleteMany();
  return {
    deletedCount: result.count
  };
}
