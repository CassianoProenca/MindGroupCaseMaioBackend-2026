import type { Request } from "express"
import { describe, expect, it } from "vitest"

import { getPagination, getSearch, makePaginationMeta } from "../../src/utils/pagination.js"

function fakeRequest(query: Record<string, unknown>): Request {
  return { query } as unknown as Request
}

describe("getPagination", () => {
  it("usa valores padroes quando query nao informa nada", () => {
    expect(getPagination(fakeRequest({}))).toEqual({ page: 1, perPage: 10, skip: 0, take: 10 })
  })

  it("calcula skip corretamente para page > 1", () => {
    expect(getPagination(fakeRequest({ page: "3", perPage: "5" }))).toEqual({
      page: 3,
      perPage: 5,
      skip: 10,
      take: 5,
    })
  })

  it("rejeita pagina nao positiva e cai no padrao", () => {
    expect(getPagination(fakeRequest({ page: "-1" })).page).toBe(1)
    expect(getPagination(fakeRequest({ page: "abc" })).page).toBe(1)
    expect(getPagination(fakeRequest({ page: "1.5" })).page).toBe(1)
  })

  it("limita perPage ao maximo permitido", () => {
    expect(getPagination(fakeRequest({ perPage: "999" })).perPage).toBe(50)
  })
})

describe("makePaginationMeta", () => {
  it("calcula totalPages com arredondamento para cima", () => {
    expect(makePaginationMeta(21, 1, 10)).toEqual({ page: 1, perPage: 10, total: 21, totalPages: 3 })
  })

  it("retorna totalPages = 1 quando nao ha registros", () => {
    expect(makePaginationMeta(0, 1, 10).totalPages).toBe(1)
  })
})

describe("getSearch", () => {
  it("retorna string vazia quando ausente", () => {
    expect(getSearch(fakeRequest({}))).toBe("")
  })

  it("faz trim do termo de busca", () => {
    expect(getSearch(fakeRequest({ search: "  react  " }))).toBe("react")
  })
})
