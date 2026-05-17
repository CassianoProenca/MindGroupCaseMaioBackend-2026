import { prisma } from "../config/prisma.js"
import * as articleLikeRepository from "../repositories/articleLikeRepository.js"
import * as articleReadRepository from "../repositories/articleReadRepository.js"
import { ensureArticleCounters } from "./articleService.js"
import type { ArticleReadInput, ArticleViewInput } from "../schemas/engagementSchemas.js"

export async function registerView(articleId: number, data: ArticleViewInput) {
  const article = await ensureArticleCounters(articleId)

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
      select: { id: true, viewsCount: true, likesCount: true, bookmarksCount: true },
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
  await ensureArticleCounters(articleId)

  return articleReadRepository.create({
    articleId,
    userId,
    readerId: data.readerId,
    durationSeconds: data.durationSeconds,
  })
}

export async function getLikeStatus(articleId: number, userId: number) {
  const article = await ensureArticleCounters(articleId)
  const like = await articleLikeRepository.findByArticleAndUser(articleId, userId)
  return { article, liked: Boolean(like) }
}

export async function like(articleId: number, userId: number) {
  await ensureArticleCounters(articleId)

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

  const updated = await ensureArticleCounters(articleId)
  return { article: updated, liked: true }
}

export async function unlike(articleId: number, userId: number) {
  await ensureArticleCounters(articleId)

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

  const updated = await ensureArticleCounters(articleId)
  return { article: updated, liked: false }
}
