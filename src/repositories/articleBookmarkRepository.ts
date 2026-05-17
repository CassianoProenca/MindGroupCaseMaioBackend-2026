import { prisma } from "../config/prisma.js"
import { articleInclude } from "../mappers/articleMapper.js"

export function findByArticleAndUser(articleId: number, userId: number) {
  return prisma.articleBookmark.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
  })
}

export function listByUserWithCount(userId: number, skip: number, take: number) {
  return prisma.$transaction([
    prisma.articleBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        article: { include: articleInclude },
      },
    }),
    prisma.articleBookmark.count({ where: { userId } }),
  ])
}
