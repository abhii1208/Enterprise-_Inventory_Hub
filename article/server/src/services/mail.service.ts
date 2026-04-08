import nodemailer from "nodemailer";
import createHttpError from "http-errors";
import { env } from "../config/env.js";

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    throw createHttpError(503, "Email service is not configured");
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

export async function sendMail(options: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  errorMessage?: string;
}) {
  const transporter = getTransporter();
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to.join(","),
      subject: options.subject,
      text: options.text,
      html: options.html
    });
  } catch {
    throw createHttpError(
      503,
      options.errorMessage ?? "Email could not be sent. Please contact the admin directly or configure SMTP."
    );
  }
}
