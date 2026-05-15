import "dotenv/config"

export const env = {
  port: Number(process.env.PORT ?? 3333),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
}
