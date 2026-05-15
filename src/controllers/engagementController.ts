import type { Request, Response } from "express"

import { prisma } from "../config/prisma.js"
import { sendError } from "../utils/http.js"

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

  const article = await articleExists(articleId)

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  const updatedArticle = await prisma.article.update({
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
