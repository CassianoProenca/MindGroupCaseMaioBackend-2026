import { prisma } from "../config/prisma.js"

export function findFirst(articleId: number, readerId: string) {
  return prisma.articleRead.findFirst({
    where: { articleId, readerId },
  })
}

type CreateReadData = {
  articleId: number
  userId?: number
  readerId: string
  durationSeconds: number
}

export function create(data: CreateReadData) {
  return prisma.articleRead.create({
    data,
    select: {
      id: true,
      articleId: true,
      durationSeconds: true,
      createdAt: true,
    },
  })
}
