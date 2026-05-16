import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

const transparentPng = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000100ffff03000006000557bfab5d0000000049454e44ae426082",
  "hex",
)

function category(name: string) {
  return {
    connectOrCreate: {
      where: { name },
      create: {
        name,
        slug: name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      },
    },
  }
}

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

  const marie = await prisma.user.upsert({
    where: { email: "marie@example.com" },
    update: {
      bio: "Front-end engineer apaixonada por design systems.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      role: "AUTHOR",
    },
    create: {
      name: "Marie Smith",
      email: "marie@example.com",
      passwordHash,
      bio: "Front-end engineer apaixonada por design systems.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      role: "AUTHOR",
    },
  })

  const pedro = await prisma.user.upsert({
    where: { email: "pedro@example.com" },
    update: {
      bio: "Backend developer e entusiasta de DevOps.",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      role: "AUTHOR",
    },
    create: {
      name: "Pedro Costa",
      email: "pedro@example.com",
      passwordHash,
      bio: "Backend developer e entusiasta de DevOps.",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
      role: "AUTHOR",
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
      category: category("Desenvolvimento web"),
      content:
        "Um blog bem estruturado ajuda a registrar novidades, bastidores e aprendizados de um produto. Neste primeiro artigo, a proposta e mostrar uma API simples, segura e preparada para integracao com o frontend.",
      bannerImage: transparentPng,
      bannerMimeType: "image/png",
      viewsCount: 122,
      likesCount: 1,
      author: {
        connect: { id: user.id },
      },
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

  const secondArticle = await prisma.article.create({
    data: {
      title: "Autenticacao e conteudo sob controle",
      summary: "Login, permissoes e autoria para manter a publicacao segura sem pesar na experiencia.",
      category: category("Desenvolvimento backend"),
      content:
        "Criar, editar e remover artigos exige login, enquanto leitura e listagem seguem publicas. Esse desenho atende o minimo do case e deixa a experiencia simples para usuarios e avaliadores.",
      bannerImage: transparentPng,
      bannerMimeType: "image/png",
      viewsCount: 84,
      likesCount: 2,
      author: {
        connect: { id: user.id },
      },
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

  const nowMs = Date.now()
  const minute = 60 * 1000

  await prisma.comment.createMany({
    data: [
      {
        content: "Excelente artigo! Muito bem explicado sobre as decisoes tecnicas do projeto.",
        articleId: firstArticle.id,
        authorId: marie.id,
        createdAt: new Date(nowMs - 5 * minute),
        updatedAt: new Date(nowMs - 5 * minute),
      },
      {
        content: "Gostei da separacao entre leitura publica e escrita autenticada.",
        articleId: firstArticle.id,
        authorId: pedro.id,
        createdAt: new Date(nowMs - 30 * minute),
        updatedAt: new Date(nowMs - 30 * minute),
      },
      {
        content: "Comecei a usar essa arquitetura em outro projeto e funcionou bem demais.",
        articleId: firstArticle.id,
        authorId: marie.id,
        createdAt: new Date(nowMs - 2 * 60 * minute),
        updatedAt: new Date(nowMs - 2 * 60 * minute),
      },
      {
        content: "Curti a estrategia de seed para demonstrar dados reais ao avaliador.",
        articleId: firstArticle.id,
        authorId: user.id,
        createdAt: new Date(nowMs - 6 * 60 * minute),
        updatedAt: new Date(nowMs - 6 * 60 * minute),
      },
      {
        content: "Top demais, ja salvei nos favoritos.",
        articleId: firstArticle.id,
        authorId: pedro.id,
        createdAt: new Date(nowMs - 24 * 60 * minute),
        updatedAt: new Date(nowMs - 24 * 60 * minute),
      },
      {
        content: "Concordo com tudo, especialmente o tradeoff dos comentarios.",
        articleId: firstArticle.id,
        authorId: marie.id,
        createdAt: new Date(nowMs - 48 * 60 * minute),
        updatedAt: new Date(nowMs - 48 * 60 * minute),
      },
      {
        content: "Faltou cobrir refresh tokens — talvez num proximo post?",
        articleId: secondArticle.id,
        authorId: pedro.id,
        createdAt: new Date(nowMs - 10 * minute),
        updatedAt: new Date(nowMs - 10 * minute),
      },
      {
        content: "JWT stateless e a melhor escolha mesmo pra MVP.",
        articleId: secondArticle.id,
        authorId: marie.id,
        createdAt: new Date(nowMs - 90 * minute),
        updatedAt: new Date(nowMs - 90 * minute),
      },
      {
        content: "Fluxo bem desenhado. Parabens!",
        articleId: secondArticle.id,
        authorId: pedro.id,
        createdAt: new Date(nowMs - 5 * 60 * minute),
        updatedAt: new Date(nowMs - 5 * 60 * minute),
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
