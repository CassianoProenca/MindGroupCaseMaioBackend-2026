import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  bio: z.string().trim().max(500, "Bio deve ter no maximo 500 caracteres.").optional().nullable(),
  avatarUrl: z.string().trim().url("URL de avatar invalida.").optional().nullable().or(z.literal("")),
})

export type ProfileInput = z.infer<typeof profileSchema>
