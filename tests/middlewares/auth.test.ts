import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { env } from "../../src/config/env.js"
import { AppError } from "../../src/errors/AppError.js"
import { authenticate, optionalAuthenticate } from "../../src/middlewares/auth.js"

function makeRequest(authHeader?: string): Request {
  return { headers: authHeader ? { authorization: authHeader } : {} } as unknown as Request
}

const response = {} as Response

describe("authenticate", () => {
  let next: NextFunction

  beforeEach(() => {
    next = vi.fn()
  })

  it("anexa payload em request.user e chama next quando token valido", () => {
    const token = jwt.sign({ id: 1, name: "Ana", email: "ana@example.com" }, env.jwtSecret)
    const request = makeRequest(`Bearer ${token}`)

    authenticate(request, response, next)

    expect(next).toHaveBeenCalled()
    expect(request.user).toMatchObject({ id: 1, name: "Ana", email: "ana@example.com" })
  })

  it("lanca AppError 401 quando header ausente", () => {
    const request = makeRequest()
    expect(() => authenticate(request, response, next)).toThrow(AppError)
    expect(next).not.toHaveBeenCalled()
  })

  it("lanca AppError 401 quando token invalido", () => {
    const request = makeRequest("Bearer token-quebrado")
    expect(() => authenticate(request, response, next)).toThrow(AppError)
  })
})

describe("optionalAuthenticate", () => {
  let next: NextFunction

  beforeEach(() => {
    next = vi.fn()
  })

  it("nao define request.user nem lanca quando header ausente", () => {
    const request = makeRequest()
    optionalAuthenticate(request, response, next)
    expect(request.user).toBeUndefined()
    expect(next).toHaveBeenCalled()
  })

  it("anexa user quando token valido", () => {
    const token = jwt.sign({ id: 2, name: "Bia", email: "bia@example.com" }, env.jwtSecret)
    const request = makeRequest(`Bearer ${token}`)
    optionalAuthenticate(request, response, next)
    expect(request.user).toMatchObject({ id: 2 })
    expect(next).toHaveBeenCalled()
  })

  it("ignora token invalido sem lancar", () => {
    const request = makeRequest("Bearer xx")
    optionalAuthenticate(request, response, next)
    expect(request.user).toBeUndefined()
    expect(next).toHaveBeenCalled()
  })
})
