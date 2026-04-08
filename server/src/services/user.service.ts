import { Role } from "@prisma/client";
import createHttpError from "http-errors";
import { prisma } from "../config/prisma.js";
import { hashPassword } from "../utils/password.js";

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type UpdateUserInput = {
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
};

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true
    }
  });
}

export async function createUser(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw createHttpError(409, "A user with this email already exists");
  }

  return prisma.user.create({
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: input.role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const existing = await prisma.user.findFirst({
    where: {
      email: input.email.toLowerCase(),
      NOT: { id: userId }
    }
  });

  if (existing) {
    throw createHttpError(409, "A user with this email already exists");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      role: input.role,
      isActive: input.isActive
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function resetPassword(userId: string, password: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password)
    },
    select: {
      id: true,
      email: true
    }
  });
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      isActive: true,
      email: true
    }
  });
}

export async function deleteUserPermanently(userId: string, actorId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true
    }
  });

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (actorId && actorId === userId) {
    throw createHttpError(400, "You cannot permanently delete your own account");
  }

  await prisma.auditLog.deleteMany({
    where: {
      actorId: userId
    }
  });

  await prisma.importLog.deleteMany({
    where: {
      uploadedById: userId
    }
  });

  await prisma.user.delete({
    where: {
      id: userId
    }
  });

  return user;
}
