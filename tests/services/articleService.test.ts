import { beforeEach, describe, expect, it, vi } from "vitest"

import { AppError } from "../../src/errors/AppError.js"

vi.mock("../../src/repositories/articleRepository.js", () => ({
  findManyWithCount: vi.fn(),
  findById: vi.fn(),
  findOwnerById: vi.fn(),
  findBannerById: vi.fn(),
  findCountersById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  findManyForDashboard: vi.fn(),
}))

vi.mock("../../src/repositories/categoryRepository.js", () => ({
  getConnectOrCreateInput: vi.fn().mockReturnValue(undefined),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

import * as articleRepository from "../../src/repositories/articleRepository.js"
import { create, get, getBanner, list, remove, update } from "../../src/services/articleService.js"

function fakeArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    title: "Titulo",
    summary: null,
    content: "x".repeat(40),
    bannerImage: null,
    bannerMimeType: null,
    viewsCount: 0,
    likesCount: 0,
    publishedAt: new Date(),
    updatedAt: new Date(),
    authorId: 7,
    categoryId: null,
    category: null,
    author: {
      id: 7,
      name: "Ana",
      email: "ana@example.com",
      bio: null,
      avatarUrl: null,
      role: "AUTHOR",
    },
    tags: [],
    _count: { comments: 0 },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("articleService.list", () => {
  it("delega para o repositorio e mapeia itens", async () => {
    vi.mocked(articleRepository.findManyWithCount).mockResolvedValue([
      [fakeArticle(), fakeArticle({ id: 2 })] as never,
      2,
    ])

    const result = await list({ skip: 0, take: 10, search: "", categoryId: null })
    expect(result.total).toBe(2)
    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toHaveProperty("readingTimeMinutes")
  })
})

describe("articleService.get", () => {
  it("lanca 404 quando artigo nao existe", async () => {
    vi.mocked(articleRepository.findById).mockResolvedValue(null)
    await expect(get(123)).rejects.toThrowError(AppError)
  })
})

describe("articleService.getBanner", () => {
  it("lanca 404 quando nao ha banner", async () => {
    vi.mocked(articleRepository.findBannerById).mockResolvedValue({
      bannerImage: null,
      bannerMimeType: null,
    } as never)
    await expect(getBanner(1)).rejects.toThrowError(AppError)
  })

  it("retorna buffer e mime type quando ha banner", async () => {
    const bytes = new Uint8Array([1, 2, 3])
    vi.mocked(articleRepository.findBannerById).mockResolvedValue({
      bannerImage: bytes,
      bannerMimeType: "image/png",
    } as never)

    const result = await getBanner(1)
    expect(result.mimeType).toBe("image/png")
    expect(Buffer.isBuffer(result.buffer)).toBe(true)
  })
})

describe("articleService.create", () => {
  it("rejeita criacao sem banner", async () => {
    await expect(
      create({
        authorId: 1,
        file: undefined,
        data: { title: "Titulo ok", content: "x".repeat(25), tags: [] },
      }),
    ).rejects.toThrowError(AppError)
    expect(articleRepository.create).not.toHaveBeenCalled()
  })

  it("cria quando banner enviado", async () => {
    vi.mocked(articleRepository.create).mockResolvedValue(fakeArticle() as never)

    const file = { buffer: Buffer.from([1, 2]), mimetype: "image/png" } as Express.Multer.File
    const result = await create({
      authorId: 7,
      file,
      data: { title: "Titulo ok", content: "x".repeat(25), tags: ["react"] },
    })

    expect(articleRepository.create).toHaveBeenCalledOnce()
    expect(result.id).toBe(1)
  })
})

describe("articleService.update", () => {
  it("rejeita quando autor nao confere", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue({ authorId: 999 } as never)

    await expect(
      update({
        id: 1,
        authorId: 7,
        file: undefined,
        data: { title: "Titulo ok", content: "x".repeat(25), tags: [] },
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it("rejeita 404 quando artigo nao existe", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue(null)
    await expect(
      update({
        id: 1,
        authorId: 7,
        file: undefined,
        data: { title: "Titulo ok", content: "x".repeat(25), tags: [] },
      }),
    ).rejects.toMatchObject({ status: 404 })
  })

  it("permite atualizacao quando autor confere", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue({ authorId: 7 } as never)
    vi.mocked(articleRepository.update).mockResolvedValue(fakeArticle() as never)

    await update({
      id: 1,
      authorId: 7,
      file: undefined,
      data: { title: "Titulo ok", content: "x".repeat(25), tags: [] },
    })
    expect(articleRepository.update).toHaveBeenCalledOnce()
  })
})

describe("articleService.remove", () => {
  it("rejeita quando autor nao confere", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue({ authorId: 999 } as never)
    await expect(remove(1, 7)).rejects.toMatchObject({ status: 403 })
    expect(articleRepository.remove).not.toHaveBeenCalled()
  })

  it("remove quando autor e o dono", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue({ authorId: 7 } as never)
    vi.mocked(articleRepository.remove).mockResolvedValue({} as never)
    await remove(1, 7)
    expect(articleRepository.remove).toHaveBeenCalledWith(1)
  })
})
