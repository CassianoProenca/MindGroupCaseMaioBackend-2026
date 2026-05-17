import { beforeEach, describe, expect, it, vi } from "vitest"

import { AppError } from "../../src/errors/AppError.js"

vi.mock("../../src/repositories/userRepository.js", () => ({
  findProfileById: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock("../../src/repositories/articleRepository.js", () => ({
  findManyForDashboard: vi.fn(),
}))

vi.mock("../../src/repositories/commentRepository.js", () => ({
  countByAuthorArticles: vi.fn(),
  findRecentByAuthorArticles: vi.fn(),
}))

import * as articleRepository from "../../src/repositories/articleRepository.js"
import * as commentRepository from "../../src/repositories/commentRepository.js"
import * as userRepository from "../../src/repositories/userRepository.js"
import {
  getMyDashboardMetrics,
  getMyProfile,
  updateMyProfile,
} from "../../src/services/profileService.js"

const baseProfile = {
  id: 1,
  name: "Ana",
  email: "ana@example.com",
  bio: null,
  avatarUrl: null,
  role: "AUTHOR",
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("profileService.getMyProfile", () => {
  it("retorna perfil mapeado quando existe", async () => {
    vi.mocked(userRepository.findProfileById).mockResolvedValue(baseProfile as never)
    await expect(getMyProfile(1)).resolves.toMatchObject({ id: 1, email: "ana@example.com" })
  })

  it("lanca 404 quando nao existe", async () => {
    vi.mocked(userRepository.findProfileById).mockResolvedValue(null)
    await expect(getMyProfile(1)).rejects.toThrowError(AppError)
  })
})

describe("profileService.updateMyProfile", () => {
  it("converte avatarUrl vazia em null", async () => {
    vi.mocked(userRepository.updateProfile).mockResolvedValue(baseProfile as never)
    await updateMyProfile(1, { name: "Ana", bio: null, avatarUrl: "" })
    expect(userRepository.updateProfile).toHaveBeenCalledWith(1, {
      name: "Ana",
      bio: null,
      avatarUrl: null,
    })
  })

  it("preserva avatarUrl quando ha valor", async () => {
    vi.mocked(userRepository.updateProfile).mockResolvedValue(baseProfile as never)
    await updateMyProfile(1, { name: "Ana", bio: "dev", avatarUrl: "https://x/a.png" })
    expect(userRepository.updateProfile).toHaveBeenCalledWith(1, {
      name: "Ana",
      bio: "dev",
      avatarUrl: "https://x/a.png",
    })
  })
})

describe("profileService.getMyDashboardMetrics", () => {
  it("agrega views, likes, comentarios e tempo de leitura", async () => {
    vi.mocked(articleRepository.findManyForDashboard).mockResolvedValue([
      {
        id: 1,
        title: "A",
        summary: null,
        content: "x".repeat(50),
        bannerImage: null,
        viewsCount: 10,
        likesCount: 0,
        publishedAt: new Date(),
        updatedAt: new Date(),
        category: null,
        reads: [{ durationSeconds: 30 }, { durationSeconds: 90 }],
        _count: { likes: 2, comments: 3 },
      },
      {
        id: 2,
        title: "B",
        summary: null,
        content: "y".repeat(50),
        bannerImage: null,
        viewsCount: 5,
        likesCount: 0,
        publishedAt: new Date(),
        updatedAt: new Date(),
        category: null,
        reads: [],
        _count: { likes: 1, comments: 0 },
      },
    ] as never)
    vi.mocked(commentRepository.countByAuthorArticles).mockResolvedValue(4)

    const result = await getMyDashboardMetrics(1)
    expect(result.totals.articles).toBe(2)
    expect(result.totals.views).toBe(15)
    expect(result.totals.likes).toBe(3)
    expect(result.totals.reads).toBe(2)
    expect(result.totals.totalReadSeconds).toBe(120)
    expect(result.totals.engagement).toBe(4)
    expect(result.totals.averageReadSeconds).toBe(60)
    expect(result.articleMetrics).toHaveLength(2)
    expect(result.articleMetrics[0].averageReadSeconds).toBe(60)
    expect(result.articleMetrics[1].averageReadSeconds).toBe(0)
    expect(result.topArticles[0].id).toBe(1)
  })

  it("retorna zeros quando autor nao tem artigos", async () => {
    vi.mocked(articleRepository.findManyForDashboard).mockResolvedValue([] as never)
    vi.mocked(commentRepository.countByAuthorArticles).mockResolvedValue(0)

    const result = await getMyDashboardMetrics(1)
    expect(result.totals.articles).toBe(0)
    expect(result.totals.averageReadingTimeMinutes).toBe(0)
    expect(result.topArticles).toEqual([])
  })
})
