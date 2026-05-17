import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: z.string().trim().email("Email invalido.").toLowerCase(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
})

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalido.").toLowerCase(),
  password: z.string().min(1, "Senha e obrigatoria."),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email invalido.").toLowerCase(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token obrigatorio."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
