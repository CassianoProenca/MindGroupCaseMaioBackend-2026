import type { Prisma } from "@prisma/client"

import { prisma } from "../config/prisma.js"
import { makeSlug } from "../utils/slug.js"

const includeCount = {
  _count: {
    select: { articles: true },
  },
} as const

export function findMany(where: Prisma.CategoryWhereInput, skip: number, take: number) {
  return prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
      include: includeCount,
    }),
    prisma.category.count({ where }),
  ])
}

export function create(name: string) {
  return prisma.category.create({
    data: { name, slug: makeSlug(name) },
    include: includeCount,
  })
}

export function update(id: number, name: string) {
  return prisma.category.update({
    where: { id },
    data: { name, slug: makeSlug(name) },
    include: includeCount,
  })
}

export function remove(id: number) {
  return prisma.category.delete({ where: { id } })
}

export function getConnectOrCreateInput(name: string | undefined) {
  const categoryName = name?.trim()
  if (!categoryName) {
    return undefined
  }
  return {
    connectOrCreate: {
      where: { name: categoryName },
      create: {
        name: categoryName,
        slug: makeSlug(categoryName),
      },
    },
  }
}
