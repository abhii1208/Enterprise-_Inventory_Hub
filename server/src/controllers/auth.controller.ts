import type { Request, Response } from "express";
import createHttpError from "http-errors";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env, isProduction } from "../config/env.js";
import { createAuditLog } from "../services/audit.service.js";
import { getBootstrapStatus, getCurrentUser, loginUser, registerFirstAdmin } from "../services/auth.service.js";
import {
  ensureForgotPasswordOtpVerified,
  sendForgotPasswordOtp,
  sendPasswordChangeOtp,
  verifyForgotPasswordOtp,
  verifyPasswordChangeOtp
} from "../services/password-otp.service.js";
import { requestPasswordHelp } from "../services/password-request.service.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { fail, success } from "../utils/response.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerFirstAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  otp: z.string().length(6, "OTP must be 6 digits")
});

const requestChangePasswordOtpSchema = z.object({
  currentPassword: z.string().min(8)
});

const passwordHelpSchema = z.object({
  email: z.string().email()
});

const forgotPasswordRequestSchema = z.object({
  email: z.string().email()
});

const forgotPasswordVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits")
});

const forgotPasswordResetSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
});

function setAuthCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 8 * 60 * 60 * 1000
  });
}

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const { user, token } = await loginUser(payload.email, payload.password);

  setAuthCookie(res, token);
  await createAuditLog({
    actorId: user.id,
    action: "LOGIN",
    entityType: "AUTH",
    entityId: user.id,
    description: `User ${user.email} signed in`
  });

  res.json(success(user, "Login successful"));
}

export async function me(req: Request, res: Response) {
  const user = await getCurrentUser(req.user!.id);
  res.json(success(user));
}

export async function bootstrapStatus(_req: Request, res: Response) {
  const status = await getBootstrapStatus();
  res.json(success(status));
}

export async function registerBootstrapAdmin(req: Request, res: Response) {
  const payload = registerFirstAdminSchema.parse(req.body);
  const { user } = await registerFirstAdmin(payload);
  await createAuditLog({
    actorId: user.id,
    action: "ADMIN_REGISTERED",
    entityType: "AUTH",
    entityId: user.id,
    description: `Admin ${user.email} registered`
  });

  res.status(201).json(success(user, "Admin account created. Please sign in to continue."));
}

export async function requestPasswordHelpController(req: Request, res: Response) {
  const payload = passwordHelpSchema.parse(req.body);
  const result = await requestPasswordHelp(payload.email);

  await createAuditLog({
    action: "PASSWORD_HELP_REQUESTED",
    entityType: "AUTH",
    description: `Password help requested for ${payload.email}`,
    metadata: result
  });

  res.json(success(result, "Password request sent to admin"));
}

export async function requestForgotPasswordOtp(req: Request, res: Response) {
  const payload = forgotPasswordRequestSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() }
  });

  if (!user || !user.isActive) {
    res.status(404).json(fail("No active account found for this email"));
    return;
  }

  const result = await sendForgotPasswordOtp({
    id: user.id,
    name: user.name,
    email: user.email
  });

  await createAuditLog({
    actorId: user.id,
    action: "FORGOT_PASSWORD_OTP_REQUESTED",
    entityType: "AUTH",
    entityId: user.id,
    description: `Forgot-password OTP requested for ${user.email}`
  });

  res.json(success(result, "OTP sent successfully"));
}

export async function verifyForgotPasswordOtpController(req: Request, res: Response) {
  const payload = forgotPasswordVerifySchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() }
  });

  if (!user || !user.isActive) {
    res.status(404).json(fail("No active account found for this email"));
    return;
  }

  verifyForgotPasswordOtp(user.email, payload.otp);

  await createAuditLog({
    actorId: user.id,
    action: "FORGOT_PASSWORD_OTP_VERIFIED",
    entityType: "AUTH",
    entityId: user.id,
    description: `Forgot-password OTP verified for ${user.email}`
  });

  res.json(success({ ok: true }, "OTP verified successfully"));
}

export async function resetForgotPassword(req: Request, res: Response) {
  const payload = forgotPasswordResetSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() }
  });

  if (!user || !user.isActive) {
    res.status(404).json(fail("No active account found for this email"));
    return;
  }

  ensureForgotPasswordOtpVerified(user.email);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(payload.newPassword)
    }
  });

  await createAuditLog({
    actorId: user.id,
    action: "FORGOT_PASSWORD_RESET",
    entityType: "AUTH",
    entityId: user.id,
    description: `Password reset through forgot-password flow for ${user.email}`
  });

  res.json(success({ ok: true }, "Password updated successfully"));
}

export async function requestChangePasswordOtp(req: Request, res: Response) {
  const payload = requestChangePasswordOtpSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const matches = await verifyPassword(payload.currentPassword, user.passwordHash);
  if (!matches) {
    res.status(400).json(fail("Current password is incorrect"));
    return;
  }

  const result = await sendPasswordChangeOtp({
    id: user.id,
    name: user.name,
    email: user.email
  });

  await createAuditLog({
    actorId: user.id,
    action: "PASSWORD_CHANGE_OTP_REQUESTED",
    entityType: "AUTH",
    entityId: user.id,
    description: `User ${user.email} requested a password change OTP`
  });

  res.json(success(result, "OTP sent to your email"));
}

export async function logout(req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction
  });

  await createAuditLog({
    actorId: req.user?.id,
    action: "LOGOUT",
    entityType: "AUTH",
    entityId: req.user?.id,
    description: `User ${req.user?.email ?? "unknown"} signed out`
  });

  res.json(success({ ok: true }, "Logged out"));
}

export async function changePassword(req: Request, res: Response) {
  const payload = changePasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const matches = await verifyPassword(payload.currentPassword, user.passwordHash);
  if (!matches) {
    res.status(400).json(fail("Current password is incorrect"));
    return;
  }

  verifyPasswordChangeOtp(user.id, payload.otp);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(payload.newPassword) }
  });

  await createAuditLog({
    actorId: user.id,
    action: "CHANGE_PASSWORD",
    entityType: "USER",
    entityId: user.id,
    description: `User ${user.email} changed password`
  });

  res.json(success({ ok: true }, "Password updated"));
}
