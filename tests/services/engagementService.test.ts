import { beforeEach, describe, expect, it, vi } from "vitest"

import { AppError } from "../../src/errors/AppError.js"

vi.mock("../../src/repositories/articleRepository.js", () => ({
  findCountersById: vi.fn(),
}))

vi.mock("../../src/repositories/articleLikeRepository.js", () => ({
  findByArticleAndUser: vi.fn(),
}))

vi.mock("../../src/repositories/articleReadRepository.js", () => ({
  findFirst: vi.fn(),
  create: vi.fn(),
}))

vi.mock("../../src/config/prisma.js", () => ({
  prisma: {
    $transaction: vi.fn(),
    articleLike: { create: vi.fn(), delete: vi.fn() },
    article: { update: vi.fn() },
    articleRead: { create: vi.fn() },
  },
}))

import { prisma } from "../../src/config/prisma.js"
import * as articleLikeRepository from "../../src/repositories/articleLikeRepository.js"
import * as articleReadRepository from "../../src/repositories/articleReadRepository.js"
import * as articleRepository from "../../src/repositories/articleRepository.js"
import {
  getLikeStatus,
  like,
  registerRead,
  registerView,
  unlike,
} from "../../src/services/engagementService.js"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("engagementService.registerView", () => {
  it("falha quando artigo nao existe", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue(null)
    await expect(
      registerView(1, { readerId: "leitor-abcdef" }),
    ).rejects.toThrowError(AppError)
  })

  it("nao registra novo view se leitor ja visualizou", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 5,
      likesCount: 2,
    } as never)
    vi.mocked(articleReadRepository.findFirst).mockResolvedValue({ id: 99 } as never)

    const result = await registerView(1, { readerId: "leitor-abcdef" })
    expect(result.viewsCount).toBe(5)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("incrementa contagem em transacao quando leitor e novo", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 5,
      likesCount: 2,
    } as never)
    vi.mocked(articleReadRepository.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.$transaction).mockResolvedValue({
      id: 1,
      viewsCount: 6,
      likesCount: 2,
    } as never)

    const result = await registerView(1, { readerId: "leitor-abcdef" })
    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(result.viewsCount).toBe(6)
  })
})

describe("engagementService.registerRead", () => {
  it("delega para o repositorio quando artigo existe", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 0,
      likesCount: 0,
    } as never)
    vi.mocked(articleReadRepository.create).mockResolvedValue({
      id: 1,
      articleId: 1,
      durationSeconds: 30,
      createdAt: new Date(),
    } as never)

    await registerRead({
      articleId: 1,
      userId: 5,
      data: { readerId: "leitor-abcdef", durationSeconds: 30 },
    })
    expect(articleReadRepository.create).toHaveBeenCalledWith({
      articleId: 1,
      userId: 5,
      readerId: "leitor-abcdef",
      durationSeconds: 30,
    })
  })
})

describe("engagementService.getLikeStatus", () => {
  it("retorna liked=true quando existe registro", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 5,
      likesCount: 2,
    } as never)
    vi.mocked(articleLikeRepository.findByArticleAndUser).mockResolvedValue({ id: 7 } as never)

    const result = await getLikeStatus(1, 2)
    expect(result.liked).toBe(true)
  })

  it("retorna liked=false quando nao existe registro", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 5,
      likesCount: 2,
    } as never)
    vi.mocked(articleLikeRepository.findByArticleAndUser).mockResolvedValue(null)

    const result = await getLikeStatus(1, 2)
    expect(result.liked).toBe(false)
  })
})

describe("engagementService.like", () => {
  it("e idempotente: nao executa transacao quando ja curtido", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 5,
      likesCount: 2,
    } as never)
    vi.mocked(articleLikeRepository.findByArticleAndUser).mockResolvedValue({ id: 7 } as never)

    await like(1, 2)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it("cria registro e incrementa quando ainda nao curtido", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 5,
      likesCount: 2,
    } as never)
    vi.mocked(articleLikeRepository.findByArticleAndUser).mockResolvedValue(null)
    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}] as never)

    const result = await like(1, 2)
    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(result.liked).toBe(true)
  })
})

describe("engagementService.unlike", () => {
  it("nao executa transacao quando nao havia like", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 5,
      likesCount: 2,
    } as never)
    vi.mocked(articleLikeRepository.findByArticleAndUser).mockResolvedValue(null)

    const result = await unlike(1, 2)
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(result.liked).toBe(false)
  })

  it("remove e decrementa quando havia like", async () => {
    vi.mocked(articleRepository.findCountersById).mockResolvedValue({
      id: 1,
      viewsCount: 5,
      likesCount: 2,
    } as never)
    vi.mocked(articleLikeRepository.findByArticleAndUser).mockResolvedValue({ id: 7 } as never)
    vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}] as never)

    await unlike(1, 2)
    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })
})
