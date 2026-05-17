import { describe, expect, it } from "vitest"

import { toPrismaBytes } from "../../src/utils/bytes.js"

describe("toPrismaBytes", () => {
  it("converte Buffer em Uint8Array preservando os bytes", () => {
    const buffer = Buffer.from([1, 2, 3, 4, 255])
    const result = toPrismaBytes(buffer)

    expect(result).toBeInstanceOf(Uint8Array)
    expect(Array.from(result)).toEqual([1, 2, 3, 4, 255])
  })

  it("retorna um Uint8Array independente do buffer original", () => {
    const buffer = Buffer.from([10, 20, 30])
    const result = toPrismaBytes(buffer)

    buffer[0] = 0
    expect(result[0]).toBe(10)
  })
})
