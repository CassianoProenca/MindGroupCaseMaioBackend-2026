import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import { env } from "../config/env.js"
import { AppError } from "../errors/AppError.js"
import { mapPublicUser } from "../mappers/userMapper.js"
import * as userRepository from "../repositories/userRepository.js"
import type { LoginInput, RegisterInput } from "../schemas/authSchemas.js"

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
