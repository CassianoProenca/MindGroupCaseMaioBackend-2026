import { createHash, randomBytes } from "node:crypto"

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000

export function generateResetToken() {
  return randomBytes(32).toString("hex")
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}
