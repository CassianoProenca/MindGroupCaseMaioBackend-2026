import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { MulterError } from "multer"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { AppError } from "../../src/errors/AppError.js"
import { errorHandler } from "../../src/middlewares/errorHandler.js"

function makeResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response
  ;(response.status as ReturnType<typeof vi.fn>).mockReturnValue(response)
  ;(response.json as ReturnType<typeof vi.fn>).mockReturnValue(response)
  return response
}

const request = {} as Request
const next: NextFunction = vi.fn()

describe("errorHandler", () => {
  let response: Response

  beforeEach(() => {
    response = makeResponse()
  })

  it("AppError responde com status e mensagem proprios", () => {
    errorHandler(new AppError(403, "Proibido"), request, response, next)
    expect(response.status).toHaveBeenCalledWith(403)
    expect(response.json).toHaveBeenCalledWith({ message: "Proibido" })
  })

  it("ZodError responde 400 com a primeira mensagem de issue", () => {
    const schema = z.object({ name: z.string().min(5, "Curto demais") })
    try {
      schema.parse({ name: "ab" })
    } catch (zodError) {
      errorHandler(zodError, request, response, next)
    }
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({ message: "Curto demais" })
  })

  it("MulterError com LIMIT_FILE_SIZE retorna mensagem amigavel", () => {
    errorHandler(new MulterError("LIMIT_FILE_SIZE"), request, response, next)
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({
      message: "Arquivo excede o tamanho maximo permitido.",
    })
  })

  it("erros com 'banner' na mensagem viram 400", () => {
    errorHandler(new Error("O banner precisa ser uma imagem."), request, response, next)
    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({
      message: "O banner precisa ser uma imagem.",
    })
  })

  it("TokenExpiredError retorna 401", () => {
    const error = new jwt.TokenExpiredError("expirado", new Date())
    errorHandler(error, request, response, next)
    expect(response.status).toHaveBeenCalledWith(401)
    expect(response.json).toHaveBeenCalledWith({ message: "Token expirado." })
  })

  it("erro generico retorna 500", () => {
    errorHandler(new Error("explodiu"), request, response, next)
    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({ message: "explodiu" })
  })
})
