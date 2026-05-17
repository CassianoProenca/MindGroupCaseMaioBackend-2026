import nodemailer from "nodemailer"

import { env } from "../config/env.js"

let cachedTransporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  })

  return cachedTransporter
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = getTransporter()

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5">
      <h2>Redefinicao de senha - Mind Blog</h2>
      <p>Recebemos uma solicitacao para redefinir a sua senha.</p>
      <p>Clique no botao abaixo para escolher uma nova senha. O link expira em 30 minutos.</p>
      <p>
        <a
          href="${resetUrl}"
          style="display: inline-block; padding: 12px 20px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px"
        >
          Redefinir senha
        </a>
      </p>
      <p style="color: #555; font-size: 13px">
        Se voce nao solicitou a redefinicao, ignore este email. Sua senha atual continua valida.
      </p>
    </div>
  `

  const text = `Para redefinir sua senha no Mind Blog, acesse: ${resetUrl}\nEste link expira em 30 minutos.\nSe voce nao solicitou, ignore este email.`

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: "Redefinicao de senha - Mind Blog",
    html,
    text,
  })
}
