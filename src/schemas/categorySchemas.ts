import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Categoria deve ter pelo menos 2 caracteres.").max(120),
})

export const categoryIdParam = z.object({
  categoryId: z.coerce.number().int().positive("Id da categoria invalido."),
})

export type CategoryInput = z.infer<typeof categorySchema>
