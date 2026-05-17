import type { Request, Response } from "express"

import { categoryIdParam, categorySchema } from "../schemas/categorySchemas.js"
import * as categoryService from "../services/categoryService.js"
import { getPagination, getSearch, makePaginationMeta } from "../utils/pagination.js"
import { requireUser } from "../utils/requireUser.js"

export async function listCategories(request: Request, response: Response) {
  const { page, perPage, skip, take } = getPagination(request)
  const search = getSearch(request)
  const { items, total } = await categoryService.list({ page, perPage, skip, take, search })
  response.json({ categories: items, meta: makePaginationMeta(total, page, perPage) })
}

export async function createCategory(request: Request, response: Response) {
  requireUser(request)
  const data = categorySchema.parse(request.body)
  const category = await categoryService.create(data)
  response.status(201).json({ category })
}

export async function updateCategory(request: Request, response: Response) {
  requireUser(request)
  const { categoryId } = categoryIdParam.parse(request.params)
  const data = categorySchema.parse(request.body)
  const category = await categoryService.update(categoryId, data)
  response.json({ category })
}

export async function deleteCategory(request: Request, response: Response) {
  requireUser(request)
  const { categoryId } = categoryIdParam.parse(request.params)
  await categoryService.remove(categoryId)
  response.status(204).send()
}
