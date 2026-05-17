import { prisma } from "../config/prisma.js"
import { mapArticle } from "../mappers/articleMapper.js"
import * as articleBookmarkRepository from "../repositories/articleBookmarkRepository.js"
import { ensureArticleCounters } from "./articleService.js"

export async function getBookmarkStatus(articleId: number, userId: number) {
  const article = await ensureArticleCounters(articleId)
  const bookmark = await articleBookmarkRepository.findByArticleAndUser(articleId, userId)
  return { article, bookmarked: Boolean(bookmark) }
}

export async function bookmark(articleId: number, userId: number) {
  await ensureArticleCounters(articleId)

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

  const updated = await ensureArticleCounters(articleId)
  return { article: updated, bookmarked: true }
}

export async function unbookmark(articleId: number, userId: number) {
  await ensureArticleCounters(articleId)

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

  const updated = await ensureArticleCounters(articleId)
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
