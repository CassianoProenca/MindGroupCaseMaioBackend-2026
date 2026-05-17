import type { Prisma } from "@prisma/client"

import { AppError } from "../errors/AppError.js"
import { mapArticle } from "../mappers/articleMapper.js"
import * as articleRepository from "../repositories/articleRepository.js"
import * as categoryRepository from "../repositories/categoryRepository.js"
import type { ArticleInput } from "../schemas/articleSchemas.js"
import { toPrismaBytes } from "../utils/bytes.js"

type ListParams = {
  skip: number
  take: number
  search: string
  categoryId: number | null
}

export async function list({ skip, take, search, categoryId }: ListParams) {
  const where: Prisma.ArticleWhereInput = {
    ...(categoryId ? { categoryId } : {}),
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

  const [articles, total] = await articleRepository.findManyWithCount(where, skip, take)
  return { items: articles.map(mapArticle), total }
}

export async function get(id: number) {
  const article = await articleRepository.findById(id)

  if (!article) {
    throw new AppError(404, "Artigo nao encontrado.")
  }

  return mapArticle(article)
}

export async function ensureArticleCounters(id: number) {
  const article = await articleRepository.findCountersById(id)
  if (!article) {
    throw new AppError(404, "Artigo nao encontrado.")
  }
  return article
}

export async function getBanner(id: number) {
  const banner = await articleRepository.findBannerById(id)

  if (!banner?.bannerImage || !banner.bannerMimeType) {
    throw new AppError(404, "Banner nao encontrado.")
  }

  return { buffer: Buffer.from(banner.bannerImage), mimeType: banner.bannerMimeType }
}

type CreateInput = {
  authorId: number
  data: ArticleInput
  file: Express.Multer.File | undefined
}

export async function create({ authorId, data, file }: CreateInput) {
  if (!file) {
    throw new AppError(400, "Banner do artigo e obrigatorio.")
  }

  const article = await articleRepository.create({
    title: data.title,
    summary: data.summary,
    content: data.content,
    category: categoryRepository.getConnectOrCreateInput(data.category),
    bannerImage: toPrismaBytes(file.buffer),
    bannerMimeType: file.mimetype,
    author: { connect: { id: authorId } },
    tags: {
      create: data.tags.map((name) => ({
        tag: {
          connectOrCreate: {
            where: { name },
            create: { name },
          },
        },
      })),
    },
  })

  return mapArticle(article)
}

type UpdateInput = {
  id: number
  authorId: number
  data: ArticleInput
  file: Express.Multer.File | undefined
}

export async function update({ id, authorId, data, file }: UpdateInput) {
  const existing = await articleRepository.findOwnerById(id)

  if (!existing) {
    throw new AppError(404, "Artigo nao encontrado.")
  }

  if (existing.authorId !== authorId) {
    throw new AppError(403, "Voce so pode editar artigos criados por voce.")
  }

  const article = await articleRepository.update(id, {
    title: data.title,
    summary: data.summary,
    content: data.content,
    category: categoryRepository.getConnectOrCreateInput(data.category),
    tags: {
      deleteMany: {},
      create: data.tags.map((name) => ({
        tag: {
          connectOrCreate: {
            where: { name },
            create: { name },
          },
        },
      })),
    },
    ...(file
      ? {
          bannerImage: toPrismaBytes(file.buffer),
          bannerMimeType: file.mimetype,
        }
      : {}),
  })

  return mapArticle(article)
}

export async function remove(id: number, authorId: number) {
  const article = await articleRepository.findOwnerById(id)

  if (!article) {
    throw new AppError(404, "Artigo nao encontrado.")
  }

  if (article.authorId !== authorId) {
    throw new AppError(403, "Voce so pode remover artigos criados por voce.")
  }

  await articleRepository.remove(id)
}
