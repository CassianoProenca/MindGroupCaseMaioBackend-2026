import { AppError } from "../errors/AppError.js"
import { mapProfile } from "../mappers/profileMapper.js"
import * as articleRepository from "../repositories/articleRepository.js"
import * as commentRepository from "../repositories/commentRepository.js"
import * as userRepository from "../repositories/userRepository.js"
import type { ProfileInput } from "../schemas/profileSchemas.js"
import { signUserToken } from "../utils/jwt.js"
import { getReadingTimeMinutes } from "../utils/readingTime.js"

export async function getMyProfile(userId: number) {
  const user = await userRepository.findProfileById(userId)
  if (!user) {
    throw new AppError(404, "Perfil nao encontrado.")
  }
  return mapProfile(user)
}

export async function updateMyProfile(userId: number, data: ProfileInput) {
  const avatarUrl = data.avatarUrl === "" ? null : data.avatarUrl ?? null
  const user = await userRepository.updateProfile(userId, {
    name: data.name,
    bio: data.bio,
    avatarUrl,
  })
  const profile = mapProfile(user)
  const token = signUserToken({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    role: profile.role,
  })
  return { profile, token }
}

export async function getMyDashboardMetrics(userId: number) {
  const articles = await articleRepository.findManyForDashboard(userId)

  const totals = articles.reduce(
    (current, article) => {
      const readSeconds = article.reads.reduce((sum, read) => sum + read.durationSeconds, 0)
      return {
        views: current.views + article.viewsCount,
        likes: current.likes + article._count.likes,
        reads: current.reads + article.reads.length,
        readSeconds: current.readSeconds + readSeconds,
      }
    },
    { views: 0, likes: 0, reads: 0, readSeconds: 0 },
  )

  const articleMetrics = articles.map((article) => {
    const totalReadSeconds = article.reads.reduce((sum, read) => sum + read.durationSeconds, 0)
    const averageReadSeconds = article.reads.length > 0 ? Math.round(totalReadSeconds / article.reads.length) : 0

    return {
      id: article.id,
      title: article.title,
      summary: article.summary,
      bannerUrl: article.bannerImage ? `/articles/${article.id}/banner` : null,
      viewsCount: article.viewsCount,
      likesCount: article._count.likes,
      commentsCount: article._count.comments,
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

  const commentsCount = await commentRepository.countByAuthorArticles(userId)

  return {
    totals: {
      articles: articles.length,
      views: totals.views,
      likes: totals.likes,
      reads: totals.reads,
      totalReadSeconds: totals.readSeconds,
      engagement: commentsCount,
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
  }
}

type RecentActivityParams = {
  userId: number
  page: number
  perPage: number
}

export async function getMyRecentActivity({ userId, page, perPage }: RecentActivityParams) {
  const skip = (page - 1) * perPage
  const [comments, total] = await commentRepository.findRecentByAuthorArticles(userId, skip, perPage)

  return {
    items: comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author,
      article: comment.article,
    })),
    total,
  }
}
