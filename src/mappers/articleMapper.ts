import type { Prisma } from "@prisma/client"

import { getReadingTimeMinutes } from "../utils/readingTime.js"

export const articleInclude = {
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
  _count: {
    select: {
      comments: true,
    },
  },
} as const

export type ArticleWithRelations = Prisma.ArticleGetPayload<{ include: typeof articleInclude }>

export function mapArticle(article: ArticleWithRelations) {
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
    commentsCount: article._count.comments,
    readingTimeMinutes: getReadingTimeMinutes(article.content),
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    author: article.author,
    tags: article.tags.map(({ tag }) => tag.name),
  }
}
