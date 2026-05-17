import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { env } from "../../src/config/env.js"
import { AppError } from "../../src/errors/AppError.js"

vi.mock("../../src/repositories/userRepository.js", () => ({
  findByEmail: vi.fn(),
  findPublicById: vi.fn(),
  findByResetTokenHash: vi.fn(),
  create: vi.fn(),
  setResetToken: vi.fn(),
  clearResetTokenAndSetPassword: vi.fn(),
}))

vi.mock("../../src/utils/mailer.js", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}))

import * as userRepository from "../../src/repositories/userRepository.js"
import * as mailer from "../../src/utils/mailer.js"
import {
  getCurrentUser,
  login,
  register,
  requestPasswordReset,
  resetPassword,
} from "../../src/services/authService.js"

const baseUser = {
  id: 1,
  name: "Ana",
  email: "ana@example.com",
  bio: null,
  avatarUrl: null,
  role: "AUTHOR",
  passwordHash: "",
  resetTokenHash: null,
  resetTokenExpiresAt: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("authService.register", () => {
  it("cria usuario com senha hasheada e devolve token JWT", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(userRepository.create).mockResolvedValue({ ...baseUser })

    const result = await register({ name: "Ana", email: "ana@example.com", password: "secret1" })

    expect(userRepository.create).toHaveBeenCalledOnce()
    const createArgs = vi.mocked(userRepository.create).mock.calls[0][0]
    expect(createArgs.email).toBe("ana@example.com")
    expect(createArgs.passwordHash).not.toBe("secret1")
    expect(await bcrypt.compare("secret1", createArgs.passwordHash)).toBe(true)

    const decoded = jwt.verify(result.token, env.jwtSecret) as { id: number; email: string }
    expect(decoded).toMatchObject({ id: 1, email: "ana@example.com" })
  })

  it("lanca AppError 409 quando email ja existe", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({ ...baseUser })
    await expect(
      register({ name: "Ana", email: "ana@example.com", password: "secret1" }),
    ).rejects.toThrowError(AppError)
    expect(userRepository.create).not.toHaveBeenCalled()
  })
})

describe("authService.login", () => {
  it("rejeita quando email nao existe", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
    await expect(login({ email: "x@x.com", password: "any" })).rejects.toThrowError(AppError)
  })

  it("rejeita quando senha incorreta", async () => {
    const passwordHash = await bcrypt.hash("verdadeira", 4)
    vi.mocked(userRepository.findByEmail).mockResolvedValue({ ...baseUser, passwordHash })

    await expect(login({ email: "ana@example.com", password: "errada" })).rejects.toThrowError(
      AppError,
    )
  })

  it("retorna usuario publico (sem passwordHash) e token quando OK", async () => {
    const passwordHash = await bcrypt.hash("verdadeira", 4)
    vi.mocked(userRepository.findByEmail).mockResolvedValue({ ...baseUser, passwordHash })

    const result = await login({ email: "ana@example.com", password: "verdadeira" })
    expect(result.user).not.toHaveProperty("passwordHash")
    expect(result.token).toEqual(expect.any(String))
  })
})

describe("authService.getCurrentUser", () => {
  it("retorna o usuario publico", async () => {
    vi.mocked(userRepository.findPublicById).mockResolvedValue({
      id: 1,
      name: "Ana",
      email: "ana@example.com",
      bio: null,
      avatarUrl: null,
      role: "AUTHOR",
    })
    await expect(getCurrentUser(1)).resolves.toMatchObject({ id: 1 })
  })

  it("lanca AppError 401 quando usuario nao existe", async () => {
    vi.mocked(userRepository.findPublicById).mockResolvedValue(null)
    await expect(getCurrentUser(99)).rejects.toThrowError(AppError)
  })
})

describe("authService.requestPasswordReset", () => {
  it("retorna mensagem generica e nao chama mailer quando email nao existe", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
    const result = await requestPasswordReset({ email: "fantasma@x.com" })
    expect(result.message).toMatch(/recebera um link/)
    expect(mailer.sendPasswordResetEmail).not.toHaveBeenCalled()
    expect(userRepository.setResetToken).not.toHaveBeenCalled()
  })

  it("salva token e envia email quando usuario existe", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({ ...baseUser })
    vi.mocked(userRepository.setResetToken).mockResolvedValue({ ...baseUser } as never)

    const result = await requestPasswordReset({ email: "ana@example.com" })

    expect(result.message).toMatch(/recebera um link/)
    expect(userRepository.setResetToken).toHaveBeenCalledOnce()
    expect(mailer.sendPasswordResetEmail).toHaveBeenCalledOnce()
    const [emailArg, urlArg] = vi.mocked(mailer.sendPasswordResetEmail).mock.calls[0]
    expect(emailArg).toBe("ana@example.com")
    expect(urlArg).toContain("/resetar-senha/")
  })
})

describe("authService.resetPassword", () => {
  it("rejeita token nao encontrado", async () => {
    vi.mocked(userRepository.findByResetTokenHash).mockResolvedValue(null)
    await expect(resetPassword({ token: "abc", password: "novasenha" })).rejects.toThrowError(
      AppError,
    )
  })

  it("rejeita token expirado", async () => {
    vi.mocked(userRepository.findByResetTokenHash).mockResolvedValue({
      ...baseUser,
      resetTokenExpiresAt: new Date(Date.now() - 1000),
    })
    await expect(resetPassword({ token: "abc", password: "novasenha" })).rejects.toThrowError(
      AppError,
    )
  })

  it("troca senha, limpa token e devolve JWT quando token valido", async () => {
    vi.mocked(userRepository.findByResetTokenHash).mockResolvedValue({
      ...baseUser,
      resetTokenExpiresAt: new Date(Date.now() + 60_000),
    })
    vi.mocked(userRepository.clearResetTokenAndSetPassword).mockResolvedValue({
      ...baseUser,
    } as never)

    const result = await resetPassword({ token: "abc", password: "novasenha" })

    expect(userRepository.clearResetTokenAndSetPassword).toHaveBeenCalledWith(
      baseUser.id,
      expect.any(String),
    )
    const [, hashPassed] = vi.mocked(userRepository.clearResetTokenAndSetPassword).mock.calls[0]
    expect(await bcrypt.compare("novasenha", hashPassed as string)).toBe(true)
    expect(result.token).toEqual(expect.any(String))
  })
})
