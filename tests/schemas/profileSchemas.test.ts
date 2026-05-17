import { describe, expect, it } from "vitest"

import { profileSchema } from "../../src/schemas/profileSchemas.js"

describe("profileSchema", () => {
  it("aceita avatarUrl como URL valida", () => {
    const parsed = profileSchema.parse({
      name: "Ana",
      bio: "Dev",
      avatarUrl: "https://exemplo.com/a.png",
    })
    expect(parsed.avatarUrl).toBe("https://exemplo.com/a.png")
  })

  it("aceita avatarUrl vazia", () => {
    expect(profileSchema.parse({ name: "Ana", avatarUrl: "" }).avatarUrl).toBe("")
  })

  it("aceita avatarUrl nula", () => {
    expect(profileSchema.parse({ name: "Ana", avatarUrl: null }).avatarUrl).toBeNull()
  })

  it("rejeita avatarUrl invalida", () => {
    expect(() => profileSchema.parse({ name: "Ana", avatarUrl: "nao-eh-url" })).toThrow()
  })

  it("rejeita bio com mais de 500 caracteres", () => {
    expect(() => profileSchema.parse({ name: "Ana", bio: "x".repeat(501) })).toThrow(
      /500 caracteres/,
    )
  })

  it("rejeita nome com menos de 2 caracteres", () => {
    expect(() => profileSchema.parse({ name: "A" })).toThrow(/2 caracteres/)
  })
})
