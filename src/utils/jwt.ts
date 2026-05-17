import jwt from "jsonwebtoken"

import { env } from "../config/env.js"

const TOKEN_EXPIRATION = "7d"

export type TokenUser = {
  id: number
  name: string
  email: string
  bio: string | null
  avatarUrl: string | null
  role: string
}

export function signUserToken(user: TokenUser) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: TOKEN_EXPIRATION })
}
