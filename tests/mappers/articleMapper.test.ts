import { describe, expect, it } from "vitest"

import { mapArticle, type ArticleWithRelations } from "../../src/mappers/articleMapper.js"

function buildArticle(overrides: Partial<ArticleWithRelations> = {}): ArticleWithRelations {
  return {
    id: 1,
    title: "Artigo",
    summary: null,
    content: "x".repeat(50),
    bannerImage: null,
    bannerMimeType: null,
    viewsCount: 5,
    likesCount: 2,
    publishedAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-02T00:00:00Z"),
    authorId: 10,
    categoryId: null,
    category: null,
    author: {
      id: 10,
      name: "Ana",
      email: "ana@example.com",
      bio: null,
      avatarUrl: null,
      role: "AUTHOR",
    },
    tags: [],
    _count: { comments: 3 },
    ...overrides,
  } as unknown as ArticleWithRelations
}

describe("mapArticle", () => {
  it("retorna bannerUrl null quando nao ha bannerImage", () => {
    const result = mapArticle(buildArticle())
    expect(result.bannerUrl).toBeNull()
  })

  it("monta bannerUrl relativo quando ha bannerImage", () => {
    const result = mapArticle(buildArticle({ bannerImage: Buffer.from([1, 2, 3]) as unknown as Buffer }))
    expect(result.bannerUrl).toBe("/articles/1/banner")
  })

  it("expoe contagens denormalizadas e comentarios do _count", () => {
    const result = mapArticle(buildArticle({ viewsCount: 10, likesCount: 7 }))
    expect(result.viewsCount).toBe(10)
    expect(result.likesCount).toBe(7)
    expect(result.commentsCount).toBe(3)
  })

  it("achata categoria e tags", () => {
    const result = mapArticle(
      buildArticle({
        category: { id: 4, name: "Backend", slug: "backend" } as never,
        tags: [
          { tag: { name: "node" } },
          { tag: { name: "prisma" } },
        ] as never,
      }),
    )
    expect(result.categoryId).toBe(4)
    expect(result.category).toBe("Backend")
    expect(result.tags).toEqual(["node", "prisma"])
  })

  it("inclui readingTimeMinutes calculado a partir do conteudo", () => {
    const result = mapArticle(buildArticle())
    expect(result.readingTimeMinutes).toBeGreaterThanOrEqual(1)
  })
})
