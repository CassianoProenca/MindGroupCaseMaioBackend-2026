import type { Request, Response } from "express"

import { articleIdParam } from "../schemas/articleSchemas.js"
import { commentSchema } from "../schemas/commentSchemas.js"
import * as commentService from "../services/commentService.js"
import { getPagination, getSearch, makePaginationMeta } from "../utils/pagination.js"
import { requireUser } from "../utils/requireUser.js"

export async function listComments(request: Request, response: Response) {
  const { id: articleId } = articleIdParam.parse(request.params)
  const { page, perPage, skip, take } = getPagination(request)
  const search = getSearch(request)

  const { items, total } = await commentService.list({ articleId, skip, take, search })
  response.json({ comments: items, meta: makePaginationMeta(total, page, perPage) })
}

export async function createComment(request: Request, response: Response) {
  const user = requireUser(request)
  const { id: articleId } = articleIdParam.parse(request.params)
  const data = commentSchema.parse(request.body)

  const comment = await commentService.create({ articleId, authorId: user.id, data })
  response.status(201).json({ comment })
}
