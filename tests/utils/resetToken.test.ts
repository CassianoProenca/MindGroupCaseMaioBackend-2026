import { describe, expect, it } from "vitest"

import {
  RESET_TOKEN_TTL_MS,
  generateResetToken,
  hashResetToken,
} from "../../src/utils/resetToken.js"

describe("resetToken utilities", () => {
  it("gera tokens hexadecimais de 64 caracteres", () => {
    const token = generateResetToken()
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it("nao gera o mesmo token duas vezes seguidas", () => {
    expect(generateResetToken()).not.toBe(generateResetToken())
  })

  it("produz hashes deterministicos via SHA-256", () => {
    expect(hashResetToken("abc")).toBe(hashResetToken("abc"))
    expect(hashResetToken("abc")).toHaveLength(64)
    expect(hashResetToken("abc")).not.toBe(hashResetToken("abcd"))
  })

  it("expoe TTL de 30 minutos em milissegundos", () => {
    expect(RESET_TOKEN_TTL_MS).toBe(30 * 60 * 1000)
  })
})
