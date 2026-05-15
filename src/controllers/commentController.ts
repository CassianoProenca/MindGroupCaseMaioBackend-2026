import type { Request, Response } from "express"
import { z } from "zod"

import { prisma } from "../config/prisma.js"
import { sendError } from "../utils/http.js"

const commentSchema = z.object({
  content: z.string().trim().min(3, "Comentario deve ter pelo menos 3 caracteres.").max(1000),
})

function getArticleId(request: Request) {
  const articleId = Number(request.params.id)
  return Number.isNaN(articleId) ? null : articleId
}

function mapComment(comment: {
  id: number
  content: string
  createdAt: Date
  updatedAt: Date
  author: {
    id: number
    name: string
    email: string
    avatarUrl: string | null
  }
}) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.author,
  }
}

export async function listComments(request: Request, response: Response) {
  const articleId = getArticleId(request)

  if (!articleId) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true },
  })

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  const comments = await prisma.comment.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  })

  return response.json({ comments: comments.map(mapComment) })
}

export async function createComment(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const articleId = getArticleId(request)

  if (!articleId) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const parsed = commentSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true },
  })

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      articleId,
      authorId: request.user.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  })

  return response.status(201).json({ comment: mapComment(comment) })
}
