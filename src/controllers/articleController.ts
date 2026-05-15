import type { Prisma } from "@prisma/client"
import type { Request, Response } from "express"
import { z } from "zod"

import { prisma } from "../config/prisma.js"
import { sendError } from "../utils/http.js"
import { getPagination, getSearch, makePaginationMeta } from "../utils/pagination.js"

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

const categorySchema = z.object({
  name: z.string().trim().min(2, "Categoria deve ter pelo menos 2 caracteres.").max(120),
})

const articleInclude = {
  category: true,
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

function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function mapArticle(article: ArticleWithAuthor) {
  return {
    id: article.id,
    title: article.title,
    summary: article.summary,
    content: article.content,
    categoryId: article.category?.id ?? null,
    category: article.category?.name ?? null,
    bannerUrl: article.bannerImage ? `/articles/${article.id}/banner` : null,
    viewsCount: article.viewsCount,
    likesCount: article.likesCount,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    author: article.author,
    tags: article.tags.map(({ tag }) => tag.name),
  }
}

function getCategoryData(name: string | undefined) {
  const categoryName = name?.trim()

  if (!categoryName) {
    return undefined
  }

  return {
    connectOrCreate: {
      where: { name: categoryName },
      create: {
        name: categoryName,
        slug: makeSlug(categoryName),
      },
    },
  }
}

function toPrismaBytes(buffer: Buffer) {
  const bytes = new Uint8Array(buffer.length)
  bytes.set(buffer)

  return bytes
}

function mapCategory(category: {
  id: number
  name: string
  slug: string
  _count?: {
    articles: number
  }
}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    articlesCount: category._count?.articles ?? 0,
  }
}

export async function listCategories(request: Request, response: Response) {
  const { page, perPage, skip, take } = getPagination(request)
  const search = getSearch(request)
  const where: Prisma.CategoryWhereInput = search ? { name: { contains: search } } : {}

  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
      include: {
        _count: {
          select: { articles: true },
        },
      },
    }),
    prisma.category.count({ where }),
  ])

  return response.json({
    categories: categories.map(mapCategory),
    meta: makePaginationMeta(total, page, perPage),
  })
}

export async function createCategory(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const parsed = categorySchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: makeSlug(parsed.data.name),
    },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  })

  return response.status(201).json({ category: mapCategory(category) })
}

export async function updateCategory(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const id = Number(request.params.categoryId)

  if (Number.isNaN(id)) {
    return sendError(response, 400, "Id da categoria invalido.")
  }

  const parsed = categorySchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: makeSlug(parsed.data.name),
    },
    include: {
      _count: {
        select: { articles: true },
      },
    },
  })

  return response.json({ category: mapCategory(category) })
}

export async function deleteCategory(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const id = Number(request.params.categoryId)

  if (Number.isNaN(id)) {
    return sendError(response, 400, "Id da categoria invalido.")
  }

  await prisma.category.delete({ where: { id } })

  return response.status(204).send()
}

export async function listArticles(request: Request, response: Response) {
  const { page, perPage, skip, take } = getPagination(request)
  const search = getSearch(request)
  const categoryId = Number(request.query.categoryId)

  const where: Prisma.ArticleWhereInput = {
    ...(Number.isInteger(categoryId) && categoryId > 0 ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { summary: { contains: search } },
            { content: { contains: search } },
            { author: { name: { contains: search } } },
            { category: { name: { contains: search } } },
            { tags: { some: { tag: { name: { contains: search } } } } },
          ],
        }
      : {}),
  }

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take,
      include: articleInclude,
    }),
    prisma.article.count({ where }),
  ])

  return response.json({
    articles: articles.map(mapArticle),
    meta: makePaginationMeta(total, page, perPage),
  })
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
      category: getCategoryData(parsed.data.category),
      bannerImage: toPrismaBytes(request.file.buffer),
      bannerMimeType: request.file.mimetype,
      author: {
        connect: { id: request.user.id },
      },
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
      category: getCategoryData(parsed.data.category),
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
