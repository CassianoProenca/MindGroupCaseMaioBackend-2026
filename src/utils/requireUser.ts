import type { Request } from "express"

import { AppError } from "../errors/AppError.js"
import type { TokenUser } from "./jwt.js"

export function requireUser(request: Request): TokenUser {
  if (!request.user) {
    throw new AppError(401, "Usuario nao autenticado.")
  }
  return request.user
}
