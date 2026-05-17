import type { Request } from "express"

import { AppError } from "../errors/AppError.js"

export function requireUser(request: Request): { id: number; name: string; email: string } {
  if (!request.user) {
    throw new AppError(401, "Usuario nao autenticado.")
  }
  return request.user
}
