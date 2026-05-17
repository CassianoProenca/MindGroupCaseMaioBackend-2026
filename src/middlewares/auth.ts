import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

import { env } from "../config/env.js"
import { AppError } from "../errors/AppError.js"
import type { TokenUser } from "../utils/jwt.js"

type TokenPayload = TokenUser

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(401, "Token de autenticacao nao informado.")
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    request.user = jwt.verify(token, env.jwtSecret) as TokenPayload
    return next()
  } catch {
    throw new AppError(401, "Token invalido ou expirado.")
  }
}

export function optionalAuthenticate(request: Request, _response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return next()
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    request.user = jwt.verify(token, env.jwtSecret) as TokenPayload
  } catch {
    request.user = undefined
  }

  return next()
}
