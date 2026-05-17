import { z } from "zod"

export const articleSchema = z.object({
  title: z.string().trim().min(4, "Titulo deve ter pelo menos 4 caracteres."),
  content: z.string().trim().min(20, "Conteudo deve ter pelo menos 20 caracteres."),
  summary: z.string().trim().max(280, "Resumo deve ter no maximo 280 caracteres.").optional(),
  category: z.string().trim().max(120, "Categoria deve ter no maximo 120 caracteres.").optional(),
  tags: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 8)
        : [],
    ),
})

export const articleIdParam = z.object({
  id: z.coerce.number().int().positive("Id do artigo invalido."),
})

export type ArticleInput = z.infer<typeof articleSchema>
