import cors from "cors"
import express from "express"

import { env } from "./config/env.js"
import { errorHandler } from "./middlewares/errorHandler.js"
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

app.use(errorHandler)
