import createHttpError from "http-errors";
import { sendMail } from "./mail.service.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const otpStore = new Map<string, { code: string; expiresAt: number }>();
const forgotPasswordStore = new Map<string, { code: string; expiresAt: number }>();
const forgotPasswordVerified = new Set<string>();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendPasswordChangeOtp(user: { id: string; name: string; email: string }) {
  const code = generateOtp();
  otpStore.set(user.id, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS
  });

  await sendMail({
    to: [user.email],
    subject: "Your Inventory Hub password change OTP",
    text: `Hello ${user.name}, your OTP for changing your Inventory Hub password is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#18212b;">
        <h2>Password change verification</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your OTP for changing your Inventory Hub password is:</p>
        <div style="margin:20px 0;padding:14px 18px;border-radius:14px;background:#f4f1ea;font-size:28px;font-weight:700;letter-spacing:0.22em;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
    errorMessage: "OTP email could not be sent. Please check SMTP configuration and try again."
  });

  return {
    sentTo: user.email,
    expiresInMinutes: 10
  };
}

export function verifyPasswordChangeOtp(userId: string, otp: string) {
  const entry = otpStore.get(userId);
  if (!entry) {
    throw createHttpError(400, "Request a new OTP before changing the password");
  }

  if (entry.expiresAt < Date.now()) {
    otpStore.delete(userId);
    throw createHttpError(400, "OTP has expired. Request a new OTP");
  }

  if (entry.code !== otp.trim()) {
    throw createHttpError(400, "Invalid OTP");
  }

  otpStore.delete(userId);
}

export async function sendForgotPasswordOtp(user: { id: string; name: string; email: string }) {
  const code = generateOtp();
  forgotPasswordVerified.delete(user.email.toLowerCase());
  forgotPasswordStore.set(user.email.toLowerCase(), {
    code,
    expiresAt: Date.now() + OTP_TTL_MS
  });

  await sendMail({
    to: [user.email],
    subject: "Your Inventory Hub forgot-password OTP",
    text: `Hello ${user.name}, your OTP for resetting your Inventory Hub password is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#18212b;">
        <h2>Forgot password verification</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your OTP for resetting your Inventory Hub password is:</p>
        <div style="margin:20px 0;padding:14px 18px;border-radius:14px;background:#f4f1ea;font-size:28px;font-weight:700;letter-spacing:0.22em;">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
    errorMessage: "Forgot-password OTP email could not be sent. Please check SMTP configuration and try again."
  });

  return {
    sentTo: user.email,
    expiresInMinutes: 10
  };
}

export function verifyForgotPasswordOtp(email: string, otp: string) {
  const normalizedEmail = email.toLowerCase();
  const entry = forgotPasswordStore.get(normalizedEmail);
  if (!entry) {
    throw createHttpError(400, "Request a new OTP before resetting the password");
  }

  if (entry.expiresAt < Date.now()) {
    forgotPasswordStore.delete(normalizedEmail);
    throw createHttpError(400, "OTP has expired. Request a new OTP");
  }

  if (entry.code !== otp.trim()) {
    throw createHttpError(400, "Invalid OTP");
  }

  forgotPasswordStore.delete(normalizedEmail);
  forgotPasswordVerified.add(normalizedEmail);
}

export function ensureForgotPasswordOtpVerified(email: string) {
  const normalizedEmail = email.toLowerCase();
  if (!forgotPasswordVerified.has(normalizedEmail)) {
    throw createHttpError(400, "Verify the OTP before resetting the password");
  }

  forgotPasswordVerified.delete(normalizedEmail);
}
