import { AppError } from "../errors/AppError.js"
import {
  aggregateDashboardTotals,
  mapArticleMetric,
  pickTopArticles,
} from "../mappers/dashboardMapper.js"
import { mapProfile } from "../mappers/profileMapper.js"
import * as articleRepository from "../repositories/articleRepository.js"
import * as commentRepository from "../repositories/commentRepository.js"
import * as userRepository from "../repositories/userRepository.js"
import type { ProfileInput } from "../schemas/profileSchemas.js"
import { signUserToken } from "../utils/jwt.js"

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
  const commentsCount = await commentRepository.countByAuthorArticles(userId)

  const articleMetrics = articles.map(mapArticleMetric)
  const totals = aggregateDashboardTotals(articleMetrics, commentsCount)
  const topArticles = pickTopArticles(articleMetrics)

  return { totals, articleMetrics, topArticles }
}

type RecentActivityParams = {
  userId: number
  skip: number
  take: number
}

export async function getMyRecentActivity({ userId, skip, take }: RecentActivityParams) {
  const [comments, total] = await commentRepository.findRecentByAuthorArticles(userId, skip, take)

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
