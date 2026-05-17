import type { Request, Response } from "express"

import { articleIdParam } from "../schemas/articleSchemas.js"
import { articleReadSchema, articleViewSchema } from "../schemas/engagementSchemas.js"
import * as engagementService from "../services/engagementService.js"
import { requireUser } from "../utils/requireUser.js"

export async function registerArticleView(request: Request, response: Response) {
  const { id } = articleIdParam.parse(request.params)
  const data = articleViewSchema.parse(request.body)
  const article = await engagementService.registerView(id, data)
  response.json({ article })
}

export async function registerArticleRead(request: Request, response: Response) {
  const { id } = articleIdParam.parse(request.params)
  const data = articleReadSchema.parse(request.body)
  const read = await engagementService.registerRead({ articleId: id, userId: request.user?.id, data })
  response.status(201).json({ read })
}

export async function getArticleLikeStatus(request: Request, response: Response) {
  const user = requireUser(request)
  const { id } = articleIdParam.parse(request.params)
  const result = await engagementService.getLikeStatus(id, user.id)
  response.json(result)
}

export async function likeArticle(request: Request, response: Response) {
  const user = requireUser(request)
  const { id } = articleIdParam.parse(request.params)
  const result = await engagementService.like(id, user.id)
  response.json(result)
}

export async function unlikeArticle(request: Request, response: Response) {
  const user = requireUser(request)
  const { id } = articleIdParam.parse(request.params)
  const result = await engagementService.unlike(id, user.id)
  response.json(result)
}
