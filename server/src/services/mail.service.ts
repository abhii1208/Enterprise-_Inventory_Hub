import nodemailer from "nodemailer";
import createHttpError from "http-errors";
import { env } from "../config/env.js";

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS?.replace(/\s+/g, "");
  const from = env.SMTP_FROM?.trim();

  if (!host || !env.SMTP_PORT || !user || !pass || !from) {
    throw createHttpError(503, "Email service is not configured");
  }

  if (host === "smtp.gmail.com") {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      pool: true,
      maxConnections: 1,
      maxMessages: 100,
      auth: {
        user,
        pass
      }
    });

    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE || env.SMTP_PORT === 465,
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    auth: {
      user,
      pass
    },
    requireTLS: !env.SMTP_SECURE,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  return cachedTransporter;
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
      from: env.SMTP_FROM?.trim(),
      to: options.to.join(","),
      subject: options.subject,
      text: options.text,
      html: options.html
    });
  } catch (error) {
    console.error("Email send failed", error);
    throw createHttpError(
      503,
      options.errorMessage ?? "Email could not be sent. Please contact the admin directly or configure SMTP."
    );
  }
}
