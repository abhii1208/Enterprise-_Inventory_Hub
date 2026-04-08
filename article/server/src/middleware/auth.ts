import { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { env } from "../config/env.js";
import { verifySession } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) {
    return next(createHttpError(401, "Authentication required"));
  }

  try {
    const payload = verifySession(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };

    return next();
  } catch {
    return next(createHttpError(401, "Session expired or invalid"));
  }
}

export function requireRole(roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createHttpError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(createHttpError(403, "You do not have permission to access this resource"));
    }

    return next();
  };
}
