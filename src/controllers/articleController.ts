import type { Request, Response } from "express"

import { articleIdParam, articleSchema } from "../schemas/articleSchemas.js"
import * as articleService from "../services/articleService.js"
import { getPagination, getSearch, makePaginationMeta } from "../utils/pagination.js"
import { requireUser } from "../utils/requireUser.js"

function parseCategoryIdQuery(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export async function listArticles(request: Request, response: Response) {
  const { page, perPage, skip, take } = getPagination(request)
  const search = getSearch(request)
  const categoryId = parseCategoryIdQuery(request.query.categoryId)

  const { items, total } = await articleService.list({ skip, take, search, categoryId })
  response.json({ articles: items, meta: makePaginationMeta(total, page, perPage) })
}

export async function getArticle(request: Request, response: Response) {
  const { id } = articleIdParam.parse(request.params)
  const article = await articleService.get(id)
  response.json({ article })
}

export async function getArticleBanner(request: Request, response: Response) {
  const { id } = articleIdParam.parse(request.params)
  const { buffer, mimeType } = await articleService.getBanner(id)
  response.setHeader("Content-Type", mimeType)
  response.setHeader("Cache-Control", "public, max-age=86400")
  response.send(buffer)
}

export async function createArticle(request: Request, response: Response) {
  const user = requireUser(request)
  const data = articleSchema.parse(request.body)
  const article = await articleService.create({ authorId: user.id, data, file: request.file })
  response.status(201).json({ article })
}

export async function updateArticle(request: Request, response: Response) {
  const user = requireUser(request)
  const { id } = articleIdParam.parse(request.params)
  const data = articleSchema.parse(request.body)
  const article = await articleService.update({ id, authorId: user.id, data, file: request.file })
  response.json({ article })
}

export async function deleteArticle(request: Request, response: Response) {
  const user = requireUser(request)
  const { id } = articleIdParam.parse(request.params)
  await articleService.remove(id, user.id)
  response.status(204).send()
}
