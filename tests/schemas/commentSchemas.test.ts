import { describe, expect, it } from "vitest"

import { commentSchema } from "../../src/schemas/commentSchemas.js"

describe("commentSchema", () => {
  it("aceita comentario valido e remove espacos", () => {
    expect(commentSchema.parse({ content: "  Otimo artigo!  " })).toEqual({
      content: "Otimo artigo!",
    })
  })

  it("rejeita comentario com menos de 3 caracteres", () => {
    expect(() => commentSchema.parse({ content: "oi" })).toThrow(/3 caracteres/)
  })

  it("rejeita comentario com mais de 1000 caracteres", () => {
    expect(() => commentSchema.parse({ content: "x".repeat(1001) })).toThrow()
  })
})
