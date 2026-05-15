import type { Request, Response } from "express"
import { z } from "zod"

import { prisma } from "../config/prisma.js"
import { sendError } from "../utils/http.js"

const MIN_READ_SECONDS = 10
const MAX_READ_SECONDS = 3600

const articleReadSchema = z.object({
  readerId: z.string().trim().min(8).max(80),
  durationSeconds: z.number().int().min(MIN_READ_SECONDS).max(MAX_READ_SECONDS),
})

const articleViewSchema = z.object({
  readerId: z.string().trim().min(8).max(80),
})

function getArticleId(request: Request) {
  const articleId = Number(request.params.id)
  return Number.isNaN(articleId) ? null : articleId
}

async function articleExists(articleId: number) {
  return prisma.article.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      likesCount: true,
      viewsCount: true,
    },
  })
}

export async function registerArticleView(request: Request, response: Response) {
  const articleId = getArticleId(request)

  if (!articleId) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const parsed = articleViewSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, "Id do leitor invalido.")
  }

  const article = await articleExists(articleId)

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  // Verificar se este readerId já viu este artigo
  const existingRead = await prisma.articleRead.findFirst({
    where: {
      articleId,
      readerId: parsed.data.readerId,
    },
  })

  // Se já viu, apenas retorna sem incrementar
  if (existingRead) {
    return response.json({ article })
  }

  // Se não viu, incrementa viewsCount e registra a visualização
  const updatedArticle = await prisma.$transaction(async (tx) => {
    // Cria um registro de leitura com duração 0 (apenas view)
    await tx.articleRead.create({
      data: {
        articleId,
        readerId: parsed.data.readerId,
        durationSeconds: 0,
      },
    })

    // Incrementa o contador de views
    return tx.article.update({
      where: { id: articleId },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewsCount: true,
        likesCount: true,
      },
    })
  })

  return response.json({ article: updatedArticle })
}

export async function getArticleLikeStatus(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const articleId = getArticleId(request)

  if (!articleId) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const article = await articleExists(articleId)

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  const like = await prisma.articleLike.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId: request.user.id,
      },
    },
  })

  return response.json({ article, liked: Boolean(like) })
}

export async function likeArticle(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const articleId = getArticleId(request)

  if (!articleId) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const article = await articleExists(articleId)

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  const existingLike = await prisma.articleLike.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId: request.user.id,
      },
    },
  })

  if (!existingLike) {
    await prisma.$transaction([
      prisma.articleLike.create({
        data: {
          articleId,
          userId: request.user.id,
        },
      }),
      prisma.article.update({
        where: { id: articleId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      }),
    ])
  }

  const updatedArticle = await articleExists(articleId)
  return response.json({ article: updatedArticle, liked: true })
}

export async function unlikeArticle(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const articleId = getArticleId(request)

  if (!articleId) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const article = await articleExists(articleId)

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  const existingLike = await prisma.articleLike.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId: request.user.id,
      },
    },
  })

  if (existingLike) {
    await prisma.$transaction([
      prisma.articleLike.delete({
        where: {
          id: existingLike.id,
        },
      }),
      prisma.article.update({
        where: { id: articleId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      }),
    ])
  }

  const updatedArticle = await articleExists(articleId)
  return response.json({ article: updatedArticle, liked: false })
}

export async function registerArticleRead(request: Request, response: Response) {
  const articleId = getArticleId(request)

  if (!articleId) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const parsed = articleReadSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados de leitura invalidos.")
  }

  const article = await articleExists(articleId)

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  const read = await prisma.articleRead.create({
    data: {
      articleId,
      userId: request.user?.id,
      readerId: parsed.data.readerId,
      durationSeconds: parsed.data.durationSeconds,
    },
    select: {
      id: true,
      articleId: true,
      durationSeconds: true,
      createdAt: true,
    },
  })

  return response.status(201).json({ read })
}
