import nodemailer from "nodemailer";
import createHttpError from "http-errors";
import { env } from "../config/env.js";

type MailConfig = {
  host: string;
  user: string;
  pass: string;
  from: string;
  port?: number;
  secure?: boolean;
};

function getMailConfig(): MailConfig {
  const host = env.SMTP_HOST?.trim();
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS?.replace(/\s+/g, "");
  const from = env.SMTP_FROM?.trim();

  if (!host || !env.SMTP_PORT || !user || !pass || !from) {
    throw createHttpError(503, "Email service is not configured");
  }

  return { host, user, pass, from, port: env.SMTP_PORT, secure: env.SMTP_SECURE };
}

function getTransporters(config: MailConfig) {
  if (config.host === "smtp.gmail.com") {
    return [
      {
        transporter: nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: config.user,
            pass: config.pass
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000
        }),
        from: `Inventory Hub <${config.user}>`
      },
      {
        transporter: nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: config.user,
            pass: config.pass
          },
          requireTLS: true,
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000
        }),
        from: `Inventory Hub <${config.user}>`
      },
      {
        transporter: nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: config.user,
            pass: config.pass
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000
        }),
        from: `Inventory Hub <${config.user}>`
      }
    ];
  }

  return [
    {
      transporter: nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure || config.port === 465,
        auth: {
          user: config.user,
          pass: config.pass
        },
        requireTLS: !config.secure,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
      }),
      from: config.from
    }
  ];
}

export async function sendMail(options: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  errorMessage?: string;
}) {
  const config = getMailConfig();
  const attempts = getTransporters(config);
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      await Promise.race([
        attempt.transporter.sendMail({
          from: attempt.from,
          to: options.to.join(","),
          subject: options.subject,
          text: options.text,
          html: options.html
        }),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Email send timeout")), 12000);
        })
      ]);
      return;
    } catch (error) {
      lastError = error;
      console.error("Email send attempt failed", error);
    }
  }

  throw createHttpError(
    503,
    options.errorMessage ?? "Email could not be sent. Please contact the admin directly or configure SMTP."
  );
}
