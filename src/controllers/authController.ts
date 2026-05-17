import type { Request, Response } from "express"

import { loginSchema, registerSchema } from "../schemas/authSchemas.js"
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
