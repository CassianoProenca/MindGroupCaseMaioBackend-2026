import type { Request } from "express"

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 10
const MAX_PER_PAGE = 50

function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

type PaginationOptions = {
  defaultPerPage?: number
  maxPerPage?: number
}

export function getPagination(request: Request, options: PaginationOptions = {}) {
  const defaultPerPage = options.defaultPerPage ?? DEFAULT_PER_PAGE
  const maxPerPage = options.maxPerPage ?? MAX_PER_PAGE
  const page = toPositiveInteger(request.query.page, DEFAULT_PAGE)
  const perPage = Math.min(toPositiveInteger(request.query.perPage, defaultPerPage), maxPerPage)

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
