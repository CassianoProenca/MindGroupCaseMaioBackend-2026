import type { Prisma } from "@prisma/client"
import type { Request, Response } from "express"
import { z } from "zod"

import { prisma } from "../config/prisma.js"
import { sendError } from "../utils/http.js"

const articleSchema = z.object({
  title: z.string().trim().min(4, "Titulo deve ter pelo menos 4 caracteres."),
  content: z.string().trim().min(20, "Conteudo deve ter pelo menos 20 caracteres."),
  summary: z.string().trim().max(280, "Resumo deve ter no maximo 280 caracteres.").optional(),
  category: z.string().trim().max(120, "Categoria deve ter no maximo 120 caracteres.").optional(),
  tags: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 8)
        : [],
    ),
})

const articleInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
} as const

type ArticleWithAuthor = Prisma.ArticleGetPayload<{ include: typeof articleInclude }>

function mapArticle(article: ArticleWithAuthor) {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    content: article.content,
    category: article.category,
    bannerUrl: article.bannerImage ? `/articles/${article.id}/banner` : null,
    viewsCount: article.viewsCount,
    likesCount: article.likesCount,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    author: article.author,
    tags: article.tags.map(({ tag }) => tag.name),
  }
}

function toPrismaBytes(buffer: Buffer) {
  const bytes = new Uint8Array(buffer.length)
  bytes.set(buffer)

  return bytes
}

export async function listArticles(_request: Request, response: Response) {
  const articles = await prisma.article.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    include: articleInclude,
  })

  return response.json({ articles: articles.map(mapArticle) })
}

export async function getArticle(request: Request, response: Response) {
  const id = Number(request.params.id)

  if (Number.isNaN(id)) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: articleInclude,
  })

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  return response.json({ article: mapArticle(article) })
}

export async function getArticleBanner(request: Request, response: Response) {
  const id = Number(request.params.id)

  if (Number.isNaN(id)) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      bannerImage: true,
      bannerMimeType: true,
    },
  })

  if (!article?.bannerImage || !article.bannerMimeType) {
    return sendError(response, 404, "Banner nao encontrado.")
  }

  response.setHeader("Content-Type", article.bannerMimeType)
  response.setHeader("Cache-Control", "public, max-age=86400")
  return response.send(Buffer.from(article.bannerImage))
}

export async function createArticle(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const parsed = articleSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  if (!request.file) {
    return sendError(response, 400, "Banner do artigo e obrigatorio.")
  }

  const article = await prisma.article.create({
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      content: parsed.data.content,
      category: parsed.data.category,
      bannerImage: toPrismaBytes(request.file.buffer),
      bannerMimeType: request.file.mimetype,
      authorId: request.user.id,
      tags: {
        create: parsed.data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    include: articleInclude,
  })

  return response.status(201).json({ article: mapArticle(article) })
}

export async function updateArticle(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const id = Number(request.params.id)

  if (Number.isNaN(id)) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const parsed = articleSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  const existingArticle = await prisma.article.findUnique({
    where: { id },
    select: {
      authorId: true,
    },
  })

  if (!existingArticle) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  if (existingArticle.authorId !== request.user.id) {
    return sendError(response, 403, "Voce so pode editar artigos criados por voce.")
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: parsed.data.title,
      summary: parsed.data.summary,
      content: parsed.data.content,
      category: parsed.data.category,
      tags: {
        deleteMany: {},
        create: parsed.data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
      ...(request.file
        ? {
            bannerImage: toPrismaBytes(request.file.buffer),
            bannerMimeType: request.file.mimetype,
          }
        : {}),
    },
    include: articleInclude,
  })

  return response.json({ article: mapArticle(article) })
}

export async function deleteArticle(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const id = Number(request.params.id)

  if (Number.isNaN(id)) {
    return sendError(response, 400, "Id do artigo invalido.")
  }

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      authorId: true,
    },
  })

  if (!article) {
    return sendError(response, 404, "Artigo nao encontrado.")
  }

  if (article.authorId !== request.user.id) {
    return sendError(response, 403, "Voce so pode remover artigos criados por voce.")
  }

  await prisma.article.delete({ where: { id } })

  return response.status(204).send()
}
