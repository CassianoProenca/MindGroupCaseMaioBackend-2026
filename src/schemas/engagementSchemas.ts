import { z } from "zod"

const MIN_READ_SECONDS = 10
const MAX_READ_SECONDS = 3600

export const articleViewSchema = z.object({
  readerId: z.string().trim().min(8).max(80),
})

export const articleReadSchema = z.object({
  readerId: z.string().trim().min(8).max(80),
  durationSeconds: z.number().int().min(MIN_READ_SECONDS).max(MAX_READ_SECONDS),
})

export type ArticleViewInput = z.infer<typeof articleViewSchema>
export type ArticleReadInput = z.infer<typeof articleReadSchema>
