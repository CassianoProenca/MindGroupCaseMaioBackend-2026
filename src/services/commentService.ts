import type { Prisma } from "@prisma/client"

import { AppError } from "../errors/AppError.js"
import { mapComment } from "../mappers/commentMapper.js"
import * as articleRepository from "../repositories/articleRepository.js"
import * as commentRepository from "../repositories/commentRepository.js"
import type { CommentInput } from "../schemas/commentSchemas.js"

type ListParams = {
  articleId: number
  skip: number
  take: number
  search: string
}

async function ensureArticleExists(articleId: number) {
  const article = await articleRepository.findOwnerById(articleId)
  if (!article) {
    throw new AppError(404, "Artigo nao encontrado.")
  }
}

export async function list({ articleId, skip, take, search }: ListParams) {
  await ensureArticleExists(articleId)

  const where: Prisma.CommentWhereInput = {
    articleId,
    ...(search ? { content: { contains: search } } : {}),
  }

  const [comments, total] = await commentRepository.findManyWithCount(where, skip, take)
  return { items: comments.map(mapComment), total }
}

type CreateParams = {
  articleId: number
  authorId: number
  data: CommentInput
}

export async function create({ articleId, authorId, data }: CreateParams) {
  await ensureArticleExists(articleId)

  const comment = await commentRepository.create({
    articleId,
    authorId,
    content: data.content,
  })

  return mapComment(comment)
}
