import type { Request, Response } from "express"
import { z } from "zod"

import { prisma } from "../config/prisma.js"
import { sendError } from "../utils/http.js"
import { getReadingTimeMinutes } from "../utils/readingTime.js"

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  bio: z.string().trim().max(500, "Bio deve ter no maximo 500 caracteres.").optional().nullable(),
  avatarUrl: z.string().trim().url("URL de avatar invalida.").optional().nullable().or(z.literal("")),
})

function mapProfile(user: {
  id: number
  name: string
  email: string
  bio: string | null
  avatarUrl: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function getMyProfile(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const user = await prisma.user.findUnique({
    where: { id: request.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    return sendError(response, 404, "Perfil nao encontrado.")
  }

  return response.json({ profile: mapProfile(user) })
}

export async function updateMyProfile(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const parsed = profileSchema.safeParse(request.body)

  if (!parsed.success) {
    return sendError(response, 400, parsed.error.issues[0]?.message ?? "Dados invalidos.")
  }

  const avatarUrl = parsed.data.avatarUrl === "" ? null : parsed.data.avatarUrl
  const user = await prisma.user.update({
    where: { id: request.user.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio,
      avatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return response.json({ profile: mapProfile(user) })
}

export async function getMyDashboardMetrics(request: Request, response: Response) {
  if (!request.user) {
    return sendError(response, 401, "Usuario nao autenticado.")
  }

  const articles = await prisma.article.findMany({
    where: { authorId: request.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
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
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  })

  const totals = articles.reduce(
    (current, article) => {
      const readSeconds = article.reads.reduce((total, read) => total + read.durationSeconds, 0)
      const likes = article._count.likes

      return {
        views: current.views + article.viewsCount,
        likes: current.likes + likes,
        reads: current.reads + article.reads.length,
        readSeconds: current.readSeconds + readSeconds,
      }
    },
    {
      views: 0,
      likes: 0,
      reads: 0,
      readSeconds: 0,
    },
  )

  const articleMetrics = articles.map((article) => {
      const totalReadSeconds = article.reads.reduce((total, read) => total + read.durationSeconds, 0)
      const averageReadSeconds = article.reads.length > 0 ? Math.round(totalReadSeconds / article.reads.length) : 0

      return {
        id: article.id,
        title: article.title,
        summary: article.summary,
        bannerUrl: article.bannerImage ? `/articles/${article.id}/banner` : null,
        viewsCount: article.viewsCount,
        likesCount: article._count.likes,
        readsCount: article.reads.length,
        totalReadSeconds,
        averageReadSeconds,
        readingTimeMinutes: getReadingTimeMinutes(article.content),
        category: article.category?.name ?? null,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
      }
    })

  const topArticles = [...articleMetrics]
    .sort((first, second) => {
      const firstScore = first.likesCount * 2 + first.viewsCount + first.readsCount * 3
      const secondScore = second.likesCount * 2 + second.viewsCount + second.readsCount * 3
      return secondScore - firstScore
    })
    .slice(0, 5)

  const recentActivity = articles.slice(0, 5).map((article) => ({
    id: article.id,
    title: article.title,
    category: article.category?.name ?? null,
    updatedAt: article.updatedAt,
    type: article.publishedAt.getTime() === article.updatedAt.getTime() ? "published" : "updated",
  }))

  return response.json({
    metrics: {
      totals: {
        articles: articles.length,
        views: totals.views,
        likes: totals.likes,
        reads: totals.reads,
        totalReadSeconds: totals.readSeconds,
        engagement: totals.views + totals.likes,
        averageReadSeconds: totals.reads > 0 ? Math.round(totals.readSeconds / totals.reads) : 0,
        averageReadingTimeMinutes:
          articles.length > 0
            ? Math.max(
                1,
                Math.round(
                  articles.reduce((total, article) => total + getReadingTimeMinutes(article.content), 0) / articles.length,
                ),
              )
            : 0,
      },
      articleMetrics,
      topArticles,
      recentActivity,
    },
  })
}
