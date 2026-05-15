import cors from "cors"
import express, { type ErrorRequestHandler } from "express"

import { env } from "./config/env.js"

export const app = express()

app.use(cors({ origin: env.frontendUrl }))
app.use(express.json())

app.get("/health", (_request, response) => {
  response.json({ status: "ok" })
})

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const message = error instanceof Error ? error.message : "Erro interno do servidor."

  response.status(500).json({ message })
}

app.use(errorHandler)
