import { describe, expect, it } from "vitest"

import { getReadingTimeMinutes } from "../../src/utils/readingTime.js"

describe("getReadingTimeMinutes", () => {
  it("retorna pelo menos 1 minuto mesmo para conteudo vazio", () => {
    expect(getReadingTimeMinutes("")).toBe(1)
  })

  it("calcula minutos com base em 220 palavras por minuto", () => {
    const content = Array.from({ length: 440 }, () => "palavra").join(" ")
    expect(getReadingTimeMinutes(content)).toBe(2)
  })

  it("ignora marcacoes markdown ao contar palavras", () => {
    const withMarkdown = "# Titulo\n\n**texto** _italico_ `inline` [link](https://exemplo.com)"
    const plain = "Titulo texto italico inline link https://exemplo.com"
    expect(getReadingTimeMinutes(withMarkdown)).toBe(getReadingTimeMinutes(plain))
  })

  it("considera tempo extra por imagens markdown e html", () => {
    const base = Array.from({ length: 220 }, () => "p").join(" ")
    const withImages = `${base}\n\n![img](a.png)\n<img src="b.png" />`
    expect(getReadingTimeMinutes(withImages)).toBeGreaterThan(getReadingTimeMinutes(base))
  })

  it("ignora blocos de codigo cercados", () => {
    const content = "olha so\n```js\nconst x = 1\n```\nfim"
    expect(getReadingTimeMinutes(content)).toBe(1)
  })
})
