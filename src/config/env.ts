import "dotenv/config"

export const env = {
  port: Number(process.env.PORT ?? 3333),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET ?? "development_secret",
  smtp: {
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "Mind Blog <no-reply@mindblog.local>",
  },
}
