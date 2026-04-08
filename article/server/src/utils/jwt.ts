import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";

export type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
};

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
}

export function verifySession(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
}
