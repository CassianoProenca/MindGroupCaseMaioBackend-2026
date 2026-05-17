import { describe, expect, it } from "vitest"

import { articleReadSchema, articleViewSchema } from "../../src/schemas/engagementSchemas.js"

describe("articleViewSchema", () => {
  it("aceita readerId entre 8 e 80 caracteres", () => {
    expect(articleViewSchema.parse({ readerId: "12345678" })).toEqual({ readerId: "12345678" })
  })

  it("rejeita readerId curto demais", () => {
    expect(() => articleViewSchema.parse({ readerId: "abc" })).toThrow()
  })

  it("rejeita readerId longo demais", () => {
    expect(() => articleViewSchema.parse({ readerId: "x".repeat(81) })).toThrow()
  })
})

describe("articleReadSchema", () => {
  it("aceita duracao dentro dos limites", () => {
    const parsed = articleReadSchema.parse({ readerId: "12345678", durationSeconds: 60 })
    expect(parsed.durationSeconds).toBe(60)
  })

  it("rejeita duracao abaixo de 10 segundos", () => {
    expect(() => articleReadSchema.parse({ readerId: "12345678", durationSeconds: 5 })).toThrow()
  })

  it("rejeita duracao acima de 3600 segundos", () => {
    expect(() => articleReadSchema.parse({ readerId: "12345678", durationSeconds: 4000 })).toThrow()
  })

  it("rejeita duracao nao inteira", () => {
    expect(() => articleReadSchema.parse({ readerId: "12345678", durationSeconds: 12.5 })).toThrow()
  })
})
