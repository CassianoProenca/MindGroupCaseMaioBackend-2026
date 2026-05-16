import bcrypt from "bcrypt"
import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { z } from "zod"

import { env } from "../config/env.js"
import { prisma } from "../config/prisma.js"
import { sendError } from "../utils/http.js"

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: z.string().trim().email("Email invalido.").toLowerCase(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
})

const loginSchema = z.object({
  email: z.string().trim().email("Email invalido.").toLowerCase(),
  password: z.string().min(1, "Senha e obrigatoria."),
})

type TokenUser = {
  id: number
  name: string
  email: string
}

type PublicUser = TokenUser & {
  bio: string | null
  avatarUrl: string | null
  role: string
}

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  bio: true,
  avatarUrl: true,
  role: true,
} as const

function signToken(user: TokenUser) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: "7d" })
}

export async function register(request: Request, response: Response) {
  const parsed = registerSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  const { name, email, password } = parsed.data
  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    return sendError(response, 409, "Ja existe uma conta com este email.")
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: publicUserSelect,
  })

  const token = signToken({ id: user.id, name: user.name, email: user.email })
  return response.status(201).json({ user, token })
}

export async function login(request: Request, response: Response) {
  const parsed = loginSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return sendError(response, 401, "Email ou senha invalidos.")
  }

  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
  }

  const token = signToken({ id: user.id, name: user.name, email: user.email })
  return response.json({ user: publicUser, token })
}

export async function me(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: publicUserSelect,
  })

  if (!user) {
    return sendError(response, 401, "Usuario nao encontrado.")
  }

  return response.json({ user })
}
