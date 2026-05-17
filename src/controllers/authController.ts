import type { Request, Response } from "express"

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchemas.js"
import * as authService from "../services/authService.js"
import { requireUser } from "../utils/requireUser.js"

export async function register(request: Request, response: Response) {
  const data = registerSchema.parse(request.body)
  const result = await authService.register(data)
  response.status(201).json(result)
}

export async function login(request: Request, response: Response) {
  const data = loginSchema.parse(request.body)
  const result = await authService.login(data)
  response.json(result)
}

export async function me(request: Request, response: Response) {
  const current = requireUser(request)
  const user = await authService.getCurrentUser(current.id)
  response.json({ user })
}

export async function forgotPassword(request: Request, response: Response) {
  const data = forgotPasswordSchema.parse(request.body)
  const result = await authService.requestPasswordReset(data)
  response.json(result)
}

export async function resetPassword(request: Request, response: Response) {
  const data = resetPasswordSchema.parse(request.body)
  const result = await authService.resetPassword(data)
  response.json(result)
}
