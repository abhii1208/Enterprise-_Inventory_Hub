import { Role } from "@prisma/client";
import { Router } from "express";
import {
  deleteAuditLogs,
  deleteImportHistory,
  getAuditLogs,
  getDashboard,
  getImportHistory,
  getUsers,
  patchUserStatus,
  deleteUser,
  postResetPasswordOtp,
  postResetPassword,
  postVerifyResetPasswordOtp,
  postUser,
  putUser
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";

const router = Router();

router.use(requireAuth);
router.get("/dashboard", asyncHandler(getDashboard));
router.get("/users", requireRole([Role.ADMIN]), asyncHandler(getUsers));
router.post("/users", requireRole([Role.ADMIN]), asyncHandler(postUser));
router.put("/users/:id", requireRole([Role.ADMIN]), asyncHandler(putUser));
router.patch("/users/:id/status", requireRole([Role.ADMIN]), asyncHandler(patchUserStatus));
router.delete("/users/:id", requireRole([Role.ADMIN]), asyncHandler(deleteUser));
router.post("/users/:id/reset-password/request-otp", requireRole([Role.ADMIN]), asyncHandler(postResetPasswordOtp));
router.post("/users/:id/reset-password/request", requireRole([Role.ADMIN]), asyncHandler(postResetPasswordOtp));
router.post("/users/:id/request-reset-password-otp", requireRole([Role.ADMIN]), asyncHandler(postResetPasswordOtp));
router.post("/users/:id/reset-password/verify-otp", requireRole([Role.ADMIN]), asyncHandler(postVerifyResetPasswordOtp));
router.post("/users/:id/reset-password/verify", requireRole([Role.ADMIN]), asyncHandler(postVerifyResetPasswordOtp));
router.post("/users/:id/verify-reset-password-otp", requireRole([Role.ADMIN]), asyncHandler(postVerifyResetPasswordOtp));
router.post("/users/:id/reset-password", requireRole([Role.ADMIN]), asyncHandler(postResetPassword));
router.get("/import-history", asyncHandler(getImportHistory));
router.delete("/import-history", requireRole([Role.ADMIN]), asyncHandler(deleteImportHistory));
router.get("/audit-logs", asyncHandler(getAuditLogs));
router.delete("/audit-logs", requireRole([Role.ADMIN]), asyncHandler(deleteAuditLogs));

export default router;
