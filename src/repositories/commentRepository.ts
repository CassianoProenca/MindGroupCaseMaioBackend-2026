import type { Prisma } from "@prisma/client"

import { prisma } from "../config/prisma.js"

const authorInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  },
} as const

export function findManyWithCount(where: Prisma.CommentWhereInput, skip: number, take: number) {
  return prisma.$transaction([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: authorInclude,
    }),
    prisma.comment.count({ where }),
  ])
}

type CreateCommentData = {
  articleId: number
  authorId: number
  content: string
}

export function create(data: CreateCommentData) {
  return prisma.comment.create({
    data,
    include: authorInclude,
  })
}

export function countByAuthorArticles(authorId: number) {
  return prisma.comment.count({
    where: { article: { authorId } },
  })
}

export function findRecentByAuthorArticles(authorId: number, skip: number, take: number) {
  const where: Prisma.CommentWhereInput = { article: { authorId } }

  return prisma.$transaction([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        article: { select: { id: true, title: true } },
      },
    }),
    prisma.comment.count({ where }),
  ])
}
