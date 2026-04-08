import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export async function hashPassword(value: string) {
  return bcrypt.hash(value, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}

