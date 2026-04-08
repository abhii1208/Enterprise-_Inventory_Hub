import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import {
  ensureAdminResetPasswordOtpVerified,
  sendAdminResetPasswordOtp,
  verifyAdminResetPasswordOtp
} from "../services/admin-reset-otp.service.js";
import { clearAuditLogs, createAuditLog } from "../services/audit.service.js";
import { getAdminDashboardMetrics } from "../services/dashboard.service.js";
import { clearImportLogs, listImportLogs } from "../services/import.service.js";
import {
  createUser,
  deleteUserPermanently,
  listUsers,
  resetPassword,
  toggleUserStatus,
  updateUser
} from "../services/user.service.js";
import { fail, success } from "../utils/response.js";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(Role)
});

const updateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  isActive: z.boolean()
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters")
});

const verifyResetPasswordOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits")
});

const toggleSchema = z.object({
  isActive: z.boolean()
});

export async function getDashboard(_req: Request, res: Response) {
  const metrics = await getAdminDashboardMetrics();
  res.json(success(metrics));
}

export async function getUsers(_req: Request, res: Response) {
  const users = await listUsers();
  res.json(success(users));
}

export async function postUser(req: Request, res: Response) {
  const payload = createUserSchema.parse(req.body);
  const user = await createUser(payload);

  await createAuditLog({
    actorId: req.user!.id,
    action: "CREATE_USER",
    entityType: "USER",
    entityId: user.id,
    description: `Created user ${user.email}`,
    metadata: { role: user.role }
  });

  res.status(201).json(success(user, "User created"));
}

export async function putUser(req: Request, res: Response) {
  const payload = updateUserSchema.parse(req.body);
  const user = await updateUser(String(req.params.id), payload);

  await createAuditLog({
    actorId: req.user!.id,
    action: "UPDATE_USER",
    entityType: "USER",
    entityId: user.id,
    description: `Updated user ${user.email}`,
    metadata: payload
  });

  res.json(success(user, "User updated"));
}

export async function postResetPassword(req: Request, res: Response) {
  const payload = resetPasswordSchema.parse(req.body);
  ensureAdminResetPasswordOtpVerified(req.user!.id, String(req.params.id));
  const user = await resetPassword(String(req.params.id), payload.password);

  await createAuditLog({
    actorId: req.user!.id,
    action: "RESET_PASSWORD",
    entityType: "USER",
    entityId: user.id,
    description: `Reset password for ${user.email}`
  });

  res.json(success(user, "Password reset"));
}

export async function postResetPasswordOtp(req: Request, res: Response) {
  const targetUser = await prisma.user.findUnique({
    where: { id: String(req.params.id) },
    select: { id: true, email: true }
  });

  if (!targetUser) {
    res.status(404).json(fail("User not found"));
    return;
  }

  const result = await sendAdminResetPasswordOtp({
    actorId: req.user!.id,
    actorName: req.user!.email,
    actorEmail: req.user!.email,
    targetUserId: targetUser.id,
    targetEmail: targetUser.email
  });

  await createAuditLog({
    actorId: req.user!.id,
    action: "RESET_PASSWORD_OTP_REQUESTED",
    entityType: "USER",
    entityId: targetUser.id,
    description: `Requested reset-password OTP for ${targetUser.email}`
  });

  res.json(success(result, "OTP sent to admin email"));
}

export async function postVerifyResetPasswordOtp(req: Request, res: Response) {
  const payload = verifyResetPasswordOtpSchema.parse(req.body);
  const targetUser = await prisma.user.findUnique({
    where: { id: String(req.params.id) },
    select: { id: true, email: true }
  });

  if (!targetUser) {
    res.status(404).json(fail("User not found"));
    return;
  }

  verifyAdminResetPasswordOtp(req.user!.id, targetUser.id, payload.otp);

  await createAuditLog({
    actorId: req.user!.id,
    action: "RESET_PASSWORD_OTP_VERIFIED",
    entityType: "USER",
    entityId: targetUser.id,
    description: `Verified reset-password OTP for ${targetUser.email}`
  });

  res.json(success({ ok: true }, "OTP verified successfully"));
}

export async function patchUserStatus(req: Request, res: Response) {
  const payload = toggleSchema.parse(req.body);
  const user = await toggleUserStatus(String(req.params.id), payload.isActive);

  await createAuditLog({
    actorId: req.user!.id,
    action: payload.isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    entityType: "USER",
    entityId: user.id,
    description: `${payload.isActive ? "Activated" : "Deactivated"} ${user.email}`
  });

  res.json(success(user, "Status updated"));
}

export async function deleteUser(req: Request, res: Response) {
  const user = await deleteUserPermanently(String(req.params.id), req.user!.id);

  await createAuditLog({
    actorId: req.user!.id,
    action: "DELETE_USER",
    entityType: "USER",
    entityId: user.id,
    description: `Deleted user ${user.email} permanently`,
    metadata: { role: user.role }
  });

  res.json(success(user, "User deleted permanently"));
}

export async function getImportHistory(_req: Request, res: Response) {
  const history = await listImportLogs();
  res.json(success(history));
}

export async function deleteImportHistory(_req: Request, res: Response) {
  const result = await clearImportLogs();
  res.json(success(result, "Import history cleared"));
}

export async function getAuditLogs(_req: Request, res: Response) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  res.json(success(logs));
}

export async function deleteAuditLogs(_req: Request, res: Response) {
  const result = await clearAuditLogs();
  res.json(success(result, "Audit logs cleared"));
}
