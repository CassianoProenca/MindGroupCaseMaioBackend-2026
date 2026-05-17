import { describe, expect, it } from "vitest"

import { makeSlug } from "../../src/utils/slug.js"

describe("makeSlug", () => {
  it("converte texto comum em slug em caixa baixa", () => {
    expect(makeSlug("Hello World")).toBe("hello-world")
  })

  it("remove caracteres especiais e mantem apenas alfanumericos", () => {
    expect(makeSlug("React 19 & Vite 8!!!")).toBe("react-19-vite-8")
  })

  it("colapsa multiplos espacos e simbolos em um unico hifen", () => {
    expect(makeSlug("foo   bar---baz")).toBe("foo-bar-baz")
  })

  it("remove hifens das pontas", () => {
    expect(makeSlug("--mindgroup--")).toBe("mindgroup")
  })

  it("retorna string vazia para conteudo sem alfanumericos", () => {
    expect(makeSlug("!!!@@@")).toBe("")
  })
})
