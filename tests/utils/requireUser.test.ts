import type { Request } from "express"
import { describe, expect, it } from "vitest"

import { AppError } from "../../src/errors/AppError.js"
import { requireUser } from "../../src/utils/requireUser.js"

describe("requireUser", () => {
  it("retorna o usuario quando autenticado", () => {
    const request = { user: { id: 1, name: "Ana", email: "ana@example.com" } } as unknown as Request
    expect(requireUser(request)).toEqual({ id: 1, name: "Ana", email: "ana@example.com" })
  })

  it("lanca AppError 401 quando nao ha usuario", () => {
    const request = {} as unknown as Request
    expect(() => requireUser(request)).toThrowError(AppError)

    try {
      requireUser(request)
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).status).toBe(401)
    }
  })
})
