import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const transparentPng = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000100ffff03000006000557bfab5d0000000049454e44ae426082",
  "hex",
)

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10)

  const user = await prisma.user.upsert({
    where: {
      email: "cassiano@example.com",
    },
    update: {},
    create: {
      name: "Cassiano Proenca",
      email: "cassiano@example.com",
      passwordHash,
    },
  })

  await prisma.article.deleteMany({
    where: {
      authorId: user.id,
    },
  })

  await prisma.article.createMany({
    data: [
      {
        title: "Como um blog aproxima produto e comunidade",
        content:
          "Um blog bem estruturado ajuda a registrar novidades, bastidores e aprendizados de um produto. Neste primeiro artigo, a proposta e mostrar uma API simples, segura e preparada para integracao com o frontend.",
        bannerImage: transparentPng,
        bannerMimeType: "image/png",
        authorId: user.id,
      },
      {
        title: "Autenticacao e conteudo sob controle",
        content:
          "Criar, editar e remover artigos exige login, enquanto leitura e listagem seguem publicas. Esse desenho atende o minimo do case e deixa a experiencia simples para usuarios e avaliadores.",
        bannerImage: transparentPng,
        bannerMimeType: "image/png",
        authorId: user.id,
      },
    ],
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
