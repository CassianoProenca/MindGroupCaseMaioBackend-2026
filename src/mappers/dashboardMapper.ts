import type { DashboardArticle } from "../repositories/articleRepository.js"
import { getReadingTimeMinutes } from "../utils/readingTime.js"

export function mapArticleMetric(article: DashboardArticle) {
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
}

export type ArticleMetric = ReturnType<typeof mapArticleMetric>

export function aggregateDashboardTotals(metrics: ArticleMetric[], commentsCount: number) {
  const totals = metrics.reduce(
    (acc, metric) => ({
      views: acc.views + metric.viewsCount,
      likes: acc.likes + metric.likesCount,
      reads: acc.reads + metric.readsCount,
      totalReadSeconds: acc.totalReadSeconds + metric.totalReadSeconds,
      readingTimeMinutes: acc.readingTimeMinutes + metric.readingTimeMinutes,
    }),
    { views: 0, likes: 0, reads: 0, totalReadSeconds: 0, readingTimeMinutes: 0 },
  )

  return {
    articles: metrics.length,
    views: totals.views,
    likes: totals.likes,
    reads: totals.reads,
    totalReadSeconds: totals.totalReadSeconds,
    engagement: commentsCount,
    averageReadSeconds: totals.reads > 0 ? Math.round(totals.totalReadSeconds / totals.reads) : 0,
    averageReadingTimeMinutes:
      metrics.length > 0 ? Math.max(1, Math.round(totals.readingTimeMinutes / metrics.length)) : 0,
  }
}

export function pickTopArticles(metrics: ArticleMetric[], limit = 5) {
  return [...metrics]
    .sort((first, second) => {
      const firstScore = first.likesCount * 2 + first.viewsCount + first.readsCount * 3
      const secondScore = second.likesCount * 2 + second.viewsCount + second.readsCount * 3
      return secondScore - firstScore
    })
    .slice(0, limit)
}
