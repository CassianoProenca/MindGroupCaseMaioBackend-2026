import type { Prisma } from "@prisma/client"

import { prisma } from "../config/prisma.js"
import { articleInclude } from "../mappers/articleMapper.js"

export function findManyWithCount(where: Prisma.ArticleWhereInput, skip: number, take: number) {
  return prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      include: articleInclude,
    }),
    prisma.article.count({ where }),
  ])
}

export function findById(id: number) {
  return prisma.article.findUnique({ where: { id }, include: articleInclude })
}

export function findOwnerById(id: number) {
  return prisma.article.findUnique({ where: { id }, select: { authorId: true } })
}

export function findBannerById(id: number) {
  return prisma.article.findUnique({
    where: { id },
    select: { bannerImage: true, bannerMimeType: true },
  })
}

export function findCountersById(id: number) {
  return prisma.article.findUnique({
    where: { id },
    select: { id: true, likesCount: true, viewsCount: true },
  })
}

export function create(data: Prisma.ArticleCreateInput) {
  return prisma.article.create({ data, include: articleInclude })
}

export function update(id: number, data: Prisma.ArticleUpdateInput) {
  return prisma.article.update({ where: { id }, data, include: articleInclude })
}

export function remove(id: number) {
  return prisma.article.delete({ where: { id } })
}

const dashboardSelect = {
  id: true,
  title: true,
  summary: true,
  content: true,
  bannerImage: true,
  viewsCount: true,
  likesCount: true,
  publishedAt: true,
  updatedAt: true,
  reads: {
    select: {
      durationSeconds: true,
    },
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
  category: {
    select: {
      name: true,
    },
  },
} as const

export type DashboardArticle = Prisma.ArticleGetPayload<{ select: typeof dashboardSelect }>

export function findManyForDashboard(authorId: number): Promise<DashboardArticle[]> {
  return prisma.article.findMany({
    where: { authorId },
    orderBy: { updatedAt: "desc" },
    select: dashboardSelect,
  })
}
