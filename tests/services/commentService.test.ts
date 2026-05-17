import { beforeEach, describe, expect, it, vi } from "vitest"

import { AppError } from "../../src/errors/AppError.js"

vi.mock("../../src/repositories/articleRepository.js", () => ({
  findOwnerById: vi.fn(),
}))

vi.mock("../../src/repositories/commentRepository.js", () => ({
  findManyWithCount: vi.fn(),
  create: vi.fn(),
}))

import * as articleRepository from "../../src/repositories/articleRepository.js"
import * as commentRepository from "../../src/repositories/commentRepository.js"
import { create, list } from "../../src/services/commentService.js"

const fakeComment = {
  id: 1,
  content: "Bacana",
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 5, name: "Ana", email: "a@a.com", avatarUrl: null },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("commentService.list", () => {
  it("lanca 404 quando artigo nao existe", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue(null)
    await expect(list({ articleId: 1, skip: 0, take: 10, search: "" })).rejects.toThrowError(
      AppError,
    )
  })

  it("retorna lista mapeada quando artigo existe", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue({ authorId: 9 } as never)
    vi.mocked(commentRepository.findManyWithCount).mockResolvedValue([
      [fakeComment as never],
      1,
    ])

    const result = await list({ articleId: 1, skip: 0, take: 10, search: "" })
    expect(result.total).toBe(1)
    expect(result.items[0].author.name).toBe("Ana")
  })
})

describe("commentService.create", () => {
  it("lanca 404 quando artigo nao existe", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue(null)
    await expect(
      create({ articleId: 1, authorId: 2, data: { content: "ola" } }),
    ).rejects.toThrowError(AppError)
    expect(commentRepository.create).not.toHaveBeenCalled()
  })

  it("cria o comentario quando artigo existe", async () => {
    vi.mocked(articleRepository.findOwnerById).mockResolvedValue({ authorId: 9 } as never)
    vi.mocked(commentRepository.create).mockResolvedValue(fakeComment as never)

    const result = await create({ articleId: 1, authorId: 2, data: { content: "valido" } })
    expect(commentRepository.create).toHaveBeenCalledWith({
      articleId: 1,
      authorId: 2,
      content: "valido",
    })
    expect(result.id).toBe(1)
  })
})
