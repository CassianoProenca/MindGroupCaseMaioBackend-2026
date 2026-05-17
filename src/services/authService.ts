import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import { env } from "../config/env.js"
import { AppError } from "../errors/AppError.js"
import { mapPublicUser } from "../mappers/userMapper.js"
import * as userRepository from "../repositories/userRepository.js"
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../schemas/authSchemas.js"
import { sendPasswordResetEmail } from "../utils/mailer.js"
import {
  RESET_TOKEN_TTL_MS,
  generateResetToken,
  hashResetToken,
} from "../utils/resetToken.js"

const PASSWORD_SALT_ROUNDS = 10
const TOKEN_EXPIRATION = "7d"

type TokenUser = {
  id: number
  name: string
  email: string
}

function signToken(user: TokenUser) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: TOKEN_EXPIRATION })
}

export async function register(data: RegisterInput) {
  const existing = await userRepository.findByEmail(data.email)

  if (existing) {
    throw new AppError(409, "Ja existe uma conta com este email.")
  }

  const passwordHash = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS)
  const user = await userRepository.create({
    name: data.name,
    email: data.email,
    passwordHash,
  })

  const token = signToken({ id: user.id, name: user.name, email: user.email })
  return { user, token }
}

export async function login(data: LoginInput) {
  const user = await userRepository.findByEmail(data.email)

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new AppError(401, "Email ou senha invalidos.")
  }

  const token = signToken({ id: user.id, name: user.name, email: user.email })
  return { user: mapPublicUser(user), token }
}

export async function getCurrentUser(userId: number) {
  const user = await userRepository.findPublicById(userId)

  if (!user) {
    throw new AppError(401, "Usuario nao encontrado.")
  }

  return user
}

const GENERIC_FORGOT_RESPONSE = {
  message:
    "Se este email estiver cadastrado, voce recebera um link de redefinicao em instantes.",
}

export async function requestPasswordReset(data: ForgotPasswordInput) {
  const user = await userRepository.findByEmail(data.email)

  if (!user) {
    return GENERIC_FORGOT_RESPONSE
  }

  const token = generateResetToken()
  const resetTokenHash = hashResetToken(token)
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)

  await userRepository.setResetToken(user.id, { resetTokenHash, resetTokenExpiresAt })

  const resetUrl = `${env.frontendUrl.replace(/\/$/, "")}/resetar-senha/${token}`

  try {
    await sendPasswordResetEmail(user.email, resetUrl)
  } catch (error) {
    console.error("[mailer] Falha ao enviar email de reset:", error)
  }

  return GENERIC_FORGOT_RESPONSE
}

export async function resetPassword(data: ResetPasswordInput) {
  const resetTokenHash = hashResetToken(data.token)
  const user = await userRepository.findByResetTokenHash(resetTokenHash)

  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt.getTime() < Date.now()) {
    throw new AppError(400, "Token invalido ou expirado.")
  }

  const passwordHash = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS)
  await userRepository.clearResetTokenAndSetPassword(user.id, passwordHash)

  const token = signToken({ id: user.id, name: user.name, email: user.email })
  return { user: mapPublicUser(user), token }
}
