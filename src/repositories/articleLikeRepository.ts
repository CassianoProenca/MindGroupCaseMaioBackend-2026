import { prisma } from "../config/prisma.js"

export function findByArticleAndUser(articleId: number, userId: number) {
  return prisma.articleLike.findUnique({
    where: {
      articleId_userId: {
        articleId,
        userId,
      },
    },
  })
}
