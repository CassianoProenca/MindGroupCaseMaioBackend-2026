import { AppError } from "../errors/AppError.js"
import { prisma } from "../config/prisma.js"
import * as articleLikeRepository from "../repositories/articleLikeRepository.js"
import * as articleReadRepository from "../repositories/articleReadRepository.js"
import * as articleRepository from "../repositories/articleRepository.js"
import type { ArticleReadInput, ArticleViewInput } from "../schemas/engagementSchemas.js"

async function ensureArticle(articleId: number) {
  const article = await articleRepository.findCountersById(articleId)
  if (!article) {
    throw new AppError(404, "Artigo nao encontrado.")
  }
  return article
}

export async function registerView(articleId: number, data: ArticleViewInput) {
  const article = await ensureArticle(articleId)

  const existing = await articleReadRepository.findFirst(articleId, data.readerId)
  if (existing) {
    return article
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.articleRead.create({
      data: {
        articleId,
        readerId: data.readerId,
        durationSeconds: 0,
      },
    })

    return tx.article.update({
      where: { id: articleId },
      data: { viewsCount: { increment: 1 } },
      select: { id: true, viewsCount: true, likesCount: true },
    })
  })

  return updated
}

type RegisterReadParams = {
  articleId: number
  userId: number | undefined
  data: ArticleReadInput
}

export async function registerRead({ articleId, userId, data }: RegisterReadParams) {
  await ensureArticle(articleId)

  return articleReadRepository.create({
    articleId,
    userId,
    readerId: data.readerId,
    durationSeconds: data.durationSeconds,
  })
}

export async function getLikeStatus(articleId: number, userId: number) {
  const article = await ensureArticle(articleId)
  const like = await articleLikeRepository.findByArticleAndUser(articleId, userId)
  return { article, liked: Boolean(like) }
}

export async function like(articleId: number, userId: number) {
  await ensureArticle(articleId)

  const existing = await articleLikeRepository.findByArticleAndUser(articleId, userId)

  if (!existing) {
    await prisma.$transaction([
      prisma.articleLike.create({ data: { articleId, userId } }),
      prisma.article.update({
        where: { id: articleId },
        data: { likesCount: { increment: 1 } },
      }),
    ])
  }

  const updated = await ensureArticle(articleId)
  return { article: updated, liked: true }
}

export async function unlike(articleId: number, userId: number) {
  await ensureArticle(articleId)

  const existing = await articleLikeRepository.findByArticleAndUser(articleId, userId)

  if (existing) {
    await prisma.$transaction([
      prisma.articleLike.delete({ where: { id: existing.id } }),
      prisma.article.update({
        where: { id: articleId },
        data: { likesCount: { decrement: 1 } },
      }),
    ])
  }

  const updated = await ensureArticle(articleId)
  return { article: updated, liked: false }
}
