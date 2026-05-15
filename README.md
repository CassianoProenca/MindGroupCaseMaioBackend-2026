# Mind Blog API

Backend em Node.js, Express, TypeScript, Prisma e MySQL para o case de estagio da Mind Group.

## Tecnologias

- Node.js + Express
- TypeScript
- Prisma ORM
- MySQL
- Docker Compose
- bcrypt para senhas
- JWT Bearer para autenticacao
- Banner dos artigos salvo como BLOB no MySQL
- Comentarios, tags, perfil, curtidas e visualizacoes

## Como rodar com Docker

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Suba os containers:

```bash
docker compose up --build
```

3. Em outro terminal, rode o seed:

```bash
docker compose exec api npm run db:seed
```

A API ficara em `http://localhost:3333`.

## Login de teste

- Email: `cassiano@example.com`
- Senha: `123456`

## Scripts uteis

```bash
npm run dev
npm run build
npm run typecheck
npm run prisma:migrate
npm run prisma:deploy
npm run db:seed
```

## Rotas

### Healthcheck

- `GET /health`

### Autenticacao

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Exemplo de cadastro:

```json
{
  "name": "Cassiano Proenca",
  "email": "cassiano@example.com",
  "password": "123456"
}
```

### Artigos

- `GET /articles`
- `GET /articles/:id`
- `GET /articles/:id/banner`
- `GET /articles/:id/comments`
- `POST /articles/:id/comments`
- `POST /articles/:id/like`
- `DELETE /articles/:id/like`
- `POST /articles/:id/view`
- `POST /articles`
- `PUT /articles/:id`
- `DELETE /articles/:id`

Criacao e edicao usam `multipart/form-data`:

- `title`: titulo do artigo
- `content`: conteudo do artigo
- `banner`: arquivo de imagem
- `summary`: resumo opcional
- `category`: categoria opcional
- `tags`: tags opcionais separadas por virgula

As rotas de escrita exigem header:

```http
Authorization: Bearer seu_token
```

### Perfil

- `GET /profile/me`
- `PUT /profile/me`

Campos editaveis:

- `name`
- `bio`
- `avatarUrl`

## Cobertura do case

- Cadastro e login de usuarios com senha criptografada por bcrypt.
- CRUD autenticado de artigos.
- Autor relacionado ao usuario.
- Datas de publicacao e alteracao.
- Banner salvo como BLOB no MySQL.
- Dump SQL no repositorio.
- Docker Compose com API e MySQL.
- Recursos extras para enriquecer o blog: tags, categoria, resumo, comentarios, curtidas, views e perfil.

## Banco de dados

O dump SQL esta em `database.sql`. O projeto tambem inclui migrations do Prisma em `prisma/migrations`.
