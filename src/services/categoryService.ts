import type { Prisma } from "@prisma/client"

import { mapCategory } from "../mappers/categoryMapper.js"
import * as categoryRepository from "../repositories/categoryRepository.js"
import type { CategoryInput } from "../schemas/categorySchemas.js"

type ListParams = {
  page: number
  perPage: number
  skip: number
  take: number
  search: string
}

export async function list({ skip, take, search }: ListParams) {
  const where: Prisma.CategoryWhereInput = search ? { name: { contains: search } } : {}
  const [categories, total] = await categoryRepository.findMany(where, skip, take)
  return { items: categories.map(mapCategory), total }
}

export async function create(data: CategoryInput) {
  const category = await categoryRepository.create(data.name)
  return mapCategory(category)
}

export async function update(id: number, data: CategoryInput) {
  const category = await categoryRepository.update(id, data.name)
  return mapCategory(category)
}

export async function remove(id: number) {
  await categoryRepository.remove(id)
}
