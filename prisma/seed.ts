import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

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
    update: {
      bio: "Desenvolvedor Full Stack apaixonado por tecnologia e inovacao.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      role: "ADMIN",
    },
    create: {
      name: "Cassiano Proenca",
      email: "cassiano@example.com",
      passwordHash,
      bio: "Desenvolvedor Full Stack apaixonado por tecnologia e inovacao.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      role: "ADMIN",
    },
  })

  await prisma.article.deleteMany({
    where: {
      authorId: user.id,
    },
  })

  const firstArticle = await prisma.article.create({
    data: {
      title: "Como um blog aproxima produto e comunidade",
      summary: "Uma visao pratica de como conteudo tecnico fortalece produto, marca e comunidade.",
      category: "Desenvolvimento web",
      content:
        "Um blog bem estruturado ajuda a registrar novidades, bastidores e aprendizados de um produto. Neste primeiro artigo, a proposta e mostrar uma API simples, segura e preparada para integracao com o frontend.",
      bannerImage: transparentPng,
      bannerMimeType: "image/png",
      viewsCount: 122,
      likesCount: 1,
      authorId: user.id,
      tags: {
        create: ["Typescript", "Backend", "Produto"].map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
  })

  await prisma.article.create({
    data: {
      title: "Autenticacao e conteudo sob controle",
      summary: "Login, permissoes e autoria para manter a publicacao segura sem pesar na experiencia.",
      category: "Desenvolvimento backend",
      content:
        "Criar, editar e remover artigos exige login, enquanto leitura e listagem seguem publicas. Esse desenho atende o minimo do case e deixa a experiencia simples para usuarios e avaliadores.",
      bannerImage: transparentPng,
      bannerMimeType: "image/png",
      viewsCount: 84,
      likesCount: 2,
      authorId: user.id,
      tags: {
        create: ["Autenticacao", "JWT", "Express"].map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
  })

  await prisma.comment.createMany({
    data: [
      {
        content: "Excelente artigo! Muito bem explicado sobre as decisoes tecnicas do projeto.",
        articleId: firstArticle.id,
        authorId: user.id,
      },
      {
        content: "Gostei da separacao entre leitura publica e escrita autenticada.",
        articleId: firstArticle.id,
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
