import type { Request } from "express"

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 10
const MAX_PER_PAGE = 50

function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function getPagination(request: Request) {
  const page = toPositiveInteger(request.query.page, DEFAULT_PAGE)
  const perPage = Math.min(toPositiveInteger(request.query.perPage, DEFAULT_PER_PAGE), MAX_PER_PAGE)

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
  }
}

export function makePaginationMeta(total: number, page: number, perPage: number) {
  return {
    page,
    perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  }
}

export function getSearch(request: Request) {
  return String(request.query.search ?? "").trim()
}
