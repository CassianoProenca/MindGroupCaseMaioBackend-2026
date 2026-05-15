import cors from "cors"
import express, { type ErrorRequestHandler } from "express"

import { env } from "./config/env.js"
import { articleRoutes } from "./routes/articleRoutes.js"
import { authRoutes } from "./routes/authRoutes.js"
import { profileRoutes } from "./routes/profileRoutes.js"

export const app = express()

app.use(cors({ origin: env.frontendUrl }))
app.use(express.json())

app.get("/health", (_request, response) => {
  response.json({ status: "ok" })
})

app.use("/auth", authRoutes)
app.use("/articles", articleRoutes)
app.use("/profile", profileRoutes)

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const message = error instanceof Error ? error.message : "Erro interno do servidor."

  if (error instanceof Error && error.message.includes("banner")) {
    response.status(400).json({ message })
    return
  }

  response.status(500).json({ message })
}

app.use(errorHandler)
