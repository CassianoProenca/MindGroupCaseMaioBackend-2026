import type { Request, Response } from "express"

import { articleIdParam } from "../schemas/articleSchemas.js"
import * as bookmarkService from "../services/bookmarkService.js"
import { getPagination, makePaginationMeta } from "../utils/pagination.js"
import { requireUser } from "../utils/requireUser.js"

export async function getArticleBookmarkStatus(request: Request, response: Response) {
  const user = requireUser(request)
  const { id } = articleIdParam.parse(request.params)
  const result = await bookmarkService.getBookmarkStatus(id, user.id)
  response.json(result)
}

export async function bookmarkArticle(request: Request, response: Response) {
  const user = requireUser(request)
  const { id } = articleIdParam.parse(request.params)
  const result = await bookmarkService.bookmark(id, user.id)
  response.json(result)
}

export async function unbookmarkArticle(request: Request, response: Response) {
  const user = requireUser(request)
  const { id } = articleIdParam.parse(request.params)
  const result = await bookmarkService.unbookmark(id, user.id)
  response.json(result)
}

export async function listMyBookmarks(request: Request, response: Response) {
  const user = requireUser(request)
  const { page, perPage, skip, take } = getPagination(request)
  const { items, total } = await bookmarkService.listBookmarkedByUser({ userId: user.id, skip, take })
  response.json({ articles: items, meta: makePaginationMeta(total, page, perPage) })
}
