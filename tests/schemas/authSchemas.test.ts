import { describe, expect, it } from "vitest"

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../../src/schemas/authSchemas.js"

describe("registerSchema", () => {
  it("normaliza email para minusculo e faz trim do nome", () => {
    const parsed = registerSchema.parse({
      name: "  Ana  ",
      email: "  Ana@MAIL.com ",
      password: "secret1",
    })
    expect(parsed).toEqual({ name: "Ana", email: "ana@mail.com", password: "secret1" })
  })

  it("rejeita nome curto demais", () => {
    expect(() =>
      registerSchema.parse({ name: "A", email: "a@b.com", password: "secret1" }),
    ).toThrow(/2 caracteres/)
  })

  it("rejeita senha com menos de 6 caracteres", () => {
    expect(() =>
      registerSchema.parse({ name: "Ana", email: "ana@b.com", password: "123" }),
    ).toThrow(/6 caracteres/)
  })

  it("rejeita email invalido", () => {
    expect(() =>
      registerSchema.parse({ name: "Ana", email: "nao-eh-email", password: "secret1" }),
    ).toThrow(/Email invalido/)
  })
})

describe("loginSchema", () => {
  it("aceita senha nao vazia", () => {
    const parsed = loginSchema.parse({ email: "ANA@MAIL.COM", password: "x" })
    expect(parsed.email).toBe("ana@mail.com")
    expect(parsed.password).toBe("x")
  })

  it("rejeita senha vazia", () => {
    expect(() => loginSchema.parse({ email: "ana@b.com", password: "" })).toThrow(
      /Senha e obrigatoria/,
    )
  })
})

describe("forgotPasswordSchema", () => {
  it("aceita email valido", () => {
    expect(forgotPasswordSchema.parse({ email: "ana@b.com" })).toEqual({ email: "ana@b.com" })
  })
})

describe("resetPasswordSchema", () => {
  it("exige token e senha forte", () => {
    expect(resetPasswordSchema.parse({ token: "abc", password: "123456" })).toEqual({
      token: "abc",
      password: "123456",
    })
  })

  it("rejeita senha curta", () => {
    expect(() => resetPasswordSchema.parse({ token: "abc", password: "123" })).toThrow(
      /6 caracteres/,
    )
  })

  it("rejeita token vazio", () => {
    expect(() => resetPasswordSchema.parse({ token: "", password: "123456" })).toThrow(
      /Token obrigatorio/,
    )
  })
})
