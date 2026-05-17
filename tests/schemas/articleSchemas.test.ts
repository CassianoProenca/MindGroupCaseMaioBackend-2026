import { describe, expect, it } from "vitest"

import { articleIdParam, articleSchema } from "../../src/schemas/articleSchemas.js"

describe("articleSchema", () => {
  it("valida artigo completo e normaliza tags", () => {
    const parsed = articleSchema.parse({
      title: "Titulo do artigo",
      content: "x".repeat(25),
      summary: "Resumo curto",
      category: "Frontend",
      tags: "react, ,vite, react",
    })

    expect(parsed.title).toBe("Titulo do artigo")
    expect(parsed.tags).toEqual(["react", "vite", "react"])
  })

  it("retorna array vazio quando tags nao sao informadas", () => {
    const parsed = articleSchema.parse({ title: "Titulo ok", content: "x".repeat(25) })
    expect(parsed.tags).toEqual([])
  })

  it("limita o numero de tags em 8", () => {
    const tags = Array.from({ length: 15 }, (_, index) => `tag${index}`).join(",")
    const parsed = articleSchema.parse({ title: "Titulo ok", content: "x".repeat(25), tags })
    expect(parsed.tags).toHaveLength(8)
  })

  it("rejeita titulo curto", () => {
    expect(() => articleSchema.parse({ title: "abc", content: "x".repeat(25) })).toThrow(
      /4 caracteres/,
    )
  })

  it("rejeita conteudo curto", () => {
    expect(() => articleSchema.parse({ title: "Titulo ok", content: "curto" })).toThrow(
      /20 caracteres/,
    )
  })

  it("rejeita resumo acima de 280 caracteres", () => {
    expect(() =>
      articleSchema.parse({
        title: "Titulo ok",
        content: "x".repeat(25),
        summary: "y".repeat(281),
      }),
    ).toThrow(/280 caracteres/)
  })
})

describe("articleIdParam", () => {
  it("converte id em numero", () => {
    expect(articleIdParam.parse({ id: "42" })).toEqual({ id: 42 })
  })

  it("rejeita id nao positivo", () => {
    expect(() => articleIdParam.parse({ id: "0" })).toThrow(/Id do artigo invalido/)
    expect(() => articleIdParam.parse({ id: "abc" })).toThrow()
  })
})
