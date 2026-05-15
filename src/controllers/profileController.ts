import type { Request, Response } from "express"
import { z } from "zod"

import { prisma } from "../config/prisma.js"
import { sendError } from "../utils/http.js"

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  bio: z.string().trim().max(500, "Bio deve ter no maximo 500 caracteres.").optional().nullable(),
  avatarUrl: z.string().trim().url("URL de avatar invalida.").optional().nullable().or(z.literal("")),
})

function mapProfile(user: {
  id: number
  name: string
  email: string
  bio: string | null
  avatarUrl: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function getMyProfile(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    return sendError(response, 404, "Perfil nao encontrado.")
  }

  return response.json({ profile: mapProfile(user) })
}

export async function updateMyProfile(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const parsed = profileSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  const avatarUrl = parsed.data.avatarUrl === "" ? null : parsed.data.avatarUrl
  const user = await prisma.user.update({
    where: { id: request.user.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio,
      avatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return response.json({ profile: mapProfile(user) })
}
