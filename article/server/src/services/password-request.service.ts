import createHttpError from "http-errors";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { sendMail } from "./mail.service.js";

export async function requestPasswordHelp(email: string) {
  const requester = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase()
    }
  });

  if (!requester) {
    throw createHttpError(404, "No account found for this email");
  }

  const admins = await prisma.user.findMany({
    where: {
      role: Role.ADMIN,
      isActive: true
    },
    select: {
      email: true,
      name: true
    }
  });

  if (!admins.length) {
    throw createHttpError(404, "No active admin is available to receive this request");
  }

  await sendMail({
    to: admins.map((admin) => admin.email),
    subject: `Password request from ${requester.email}`,
    text: `${requester.name} (${requester.email}) has requested password help. Please contact them and reset or provide new credentials.`,
    html: `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#18212b;">
        <h2>Password help request</h2>
        <p><strong>${requester.name}</strong> (${requester.email}) has requested password help.</p>
        <p>Please contact this user and reset or share new credentials securely.</p>
      </div>
    `
  });

  return {
    requestedBy: requester.email,
    adminRecipients: admins.map((admin) => admin.email)
  };
}
