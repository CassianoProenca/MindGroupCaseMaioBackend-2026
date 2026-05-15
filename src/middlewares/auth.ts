import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

import { env } from "../config/env.js"
import { sendError } from "../utils/http.js"

type TokenPayload = {
  id: number
  name: string
  email: string
}

export function authenticate(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    return sendError(response, 401, "Token de autenticacao nao informado.")
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    request.user = jwt.verify(token, env.jwtSecret) as TokenPayload
    return next()
  } catch {
    return sendError(response, 401, "Token invalido ou expirado.")
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
