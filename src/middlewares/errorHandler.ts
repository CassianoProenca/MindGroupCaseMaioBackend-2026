import type { ErrorRequestHandler } from "express"
import jwt from "jsonwebtoken"
import { MulterError } from "multer"
import { Prisma } from "@prisma/client"
import { ZodError } from "zod"

import { AppError } from "../errors/AppError.js"

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({ message: error.message })
    return
  }

  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Dados invalidos."
    response.status(400).json({ message })
    return
  }

  if (error instanceof MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE" ? "Arquivo excede o tamanho maximo permitido." : "Erro ao processar arquivo enviado."
    response.status(400).json({ message })
    return
  }

  if (error instanceof Error && error.message.includes("banner")) {
    response.status(400).json({ message: error.message })
    return
  }

  if (error instanceof jwt.TokenExpiredError) {
    response.status(401).json({ message: "Token expirado." })
    return
  }

  if (error instanceof jwt.JsonWebTokenError) {
    response.status(401).json({ message: "Token invalido." })
    return
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      response.status(409).json({ message: "Registro duplicado." })
      return
    }
    if (error.code === "P2025") {
      response.status(404).json({ message: "Registro nao encontrado." })
      return
    }
  }

  const message = error instanceof Error ? error.message : "Erro interno do servidor."
  response.status(500).json({ message })
}
