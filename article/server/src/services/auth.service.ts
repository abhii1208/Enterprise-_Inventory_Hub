import { Role } from "@prisma/client";
import createHttpError from "http-errors";
import { prisma } from "../config/prisma.js";
import { signSession } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user || !user.isActive) {
    throw createHttpError(401, "Invalid credentials");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw createHttpError(401, "Invalid credentials");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    },
    token: signSession({
      sub: user.id,
      email: user.email,
      role: user.role
    })
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true
    }
  });

  if (!user || !user.isActive) {
    throw createHttpError(401, "Session is no longer valid");
  }

  return user;
}

export async function getBootstrapStatus() {
  const adminCount = await prisma.user.count({
    where: {
      role: Role.ADMIN
    }
  });

  return {
    requiresSetup: adminCount === 0
  };
}

export async function registerFirstAdmin(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({
    where: {
      email: input.email.toLowerCase()
    }
  });

  if (existing) {
    throw createHttpError(409, "A user with this email already exists");
  }

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: Role.ADMIN,
      isActive: true
    }
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    },
    token: signSession({
      sub: user.id,
      email: user.email,
      role: user.role
    })
  };
}
