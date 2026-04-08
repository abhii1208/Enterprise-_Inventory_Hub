import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { fail } from "../utils/response.js";

export function notFound(_req: Request, res: Response) {
  res.status(404).json(fail("Route not found"));
}

export function errorHandler(
  error: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json(
      fail(
        "Validation failed",
        error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      )
    );
  }

  const status = error.status ?? 500;
  const message = status >= 500 ? "An unexpected error occurred" : error.message;

  return res.status(status).json(fail(message));
}

