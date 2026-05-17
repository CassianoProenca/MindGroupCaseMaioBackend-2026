import { z } from "zod"

export const commentSchema = z.object({
  content: z.string().trim().min(3, "Comentario deve ter pelo menos 3 caracteres.").max(1000),
})

export type CommentInput = z.infer<typeof commentSchema>
