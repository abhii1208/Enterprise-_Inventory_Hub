import createHttpError from "http-errors";
import { sendMail } from "./mail.service.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const resetOtpStore = new Map<string, { code: string; expiresAt: number }>();
const verifiedResetStore = new Set<string>();

function buildKey(actorId: string, targetUserId: string) {
  return `${actorId}:${targetUserId}`;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendAdminResetPasswordOtp(input: {
  actorId: string;
  actorName: string;
  actorEmail: string;
  targetUserId: string;
  targetEmail: string;
}) {
  const code = generateOtp();
  const key = buildKey(input.actorId, input.targetUserId);
  verifiedResetStore.delete(key);
  resetOtpStore.set(key, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS
  });

  await sendMail({
    to: [input.actorEmail],
    subject: `OTP for resetting ${input.targetEmail}`,
    text: `Hello ${input.actorName}, your OTP for resetting ${input.targetEmail}'s password is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#18212b;">
        <h2>Admin password reset verification</h2>
        <p>Hello <strong>${input.actorName}</strong>,</p>
        <p>Your OTP for resetting <strong>${input.targetEmail}</strong> is:</p>
        <div style="margin:20px 0;padding:14px 18px;border-radius:14px;background:#f4f1ea;font-size:28px;font-weight:700;letter-spacing:0.22em;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
    errorMessage: "Reset-password OTP email could not be sent. Please check SMTP configuration and try again."
  });

  return {
    sentTo: input.actorEmail,
    expiresInMinutes: 10
  };
}

export function verifyAdminResetPasswordOtp(actorId: string, targetUserId: string, otp: string) {
  const key = buildKey(actorId, targetUserId);
  const entry = resetOtpStore.get(key);
  if (!entry) {
    throw createHttpError(400, "Request an OTP before resetting the password");
  }

  if (entry.expiresAt < Date.now()) {
    resetOtpStore.delete(key);
    throw createHttpError(400, "OTP has expired. Request a new OTP");
  }

  if (entry.code !== otp.trim()) {
    throw createHttpError(400, "Invalid OTP");
  }

  resetOtpStore.delete(key);
  verifiedResetStore.add(key);
}

export function ensureAdminResetPasswordOtpVerified(actorId: string, targetUserId: string) {
  const key = buildKey(actorId, targetUserId);
  if (!verifiedResetStore.has(key)) {
    throw createHttpError(400, "Verify the OTP before resetting the password");
  }

  verifiedResetStore.delete(key);
}
