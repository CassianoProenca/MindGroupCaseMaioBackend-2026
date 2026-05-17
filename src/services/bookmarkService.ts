import { AppError } from "../errors/AppError.js"
import { prisma } from "../config/prisma.js"
import { mapArticle } from "../mappers/articleMapper.js"
import * as articleBookmarkRepository from "../repositories/articleBookmarkRepository.js"
import * as articleRepository from "../repositories/articleRepository.js"

async function ensureArticle(articleId: number) {
  const article = await articleRepository.findCountersById(articleId)
  if (!article) {
    throw new AppError(404, "Artigo nao encontrado.")
  }
  return article
}

export async function getBookmarkStatus(articleId: number, userId: number) {
  const article = await ensureArticle(articleId)
  const bookmark = await articleBookmarkRepository.findByArticleAndUser(articleId, userId)
  return { article, bookmarked: Boolean(bookmark) }
}

export async function bookmark(articleId: number, userId: number) {
  await ensureArticle(articleId)

  const existing = await articleBookmarkRepository.findByArticleAndUser(articleId, userId)

  if (!existing) {
    await prisma.$transaction([
      prisma.articleBookmark.create({ data: { articleId, userId } }),
      prisma.article.update({
        where: { id: articleId },
        data: { bookmarksCount: { increment: 1 } },
      }),
    ])
  }

  const updated = await ensureArticle(articleId)
  return { article: updated, bookmarked: true }
}

export async function unbookmark(articleId: number, userId: number) {
  await ensureArticle(articleId)

  const existing = await articleBookmarkRepository.findByArticleAndUser(articleId, userId)

  if (existing) {
    await prisma.$transaction([
      prisma.articleBookmark.delete({ where: { id: existing.id } }),
      prisma.article.update({
        where: { id: articleId },
        data: { bookmarksCount: { decrement: 1 } },
      }),
    ])
  }

  const updated = await ensureArticle(articleId)
  return { article: updated, bookmarked: false }
}

type ListParams = {
  userId: number
  skip: number
  take: number
}

export async function listBookmarkedByUser({ userId, skip, take }: ListParams) {
  const [bookmarks, total] = await articleBookmarkRepository.listByUserWithCount(userId, skip, take)
  const items = bookmarks.map(({ article }) => mapArticle(article))
  return { items, total }
}
