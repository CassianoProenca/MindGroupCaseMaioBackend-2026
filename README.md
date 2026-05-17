# Mind Blog API

Backend em Node.js, Express, TypeScript, Prisma e MySQL para o case de estagio da Mind Group.

> Frontend do projeto: https://github.com/CassianoProenca/MindGroupCaseMaioFrontend-2026

## Tecnologias

- Node.js 24 + Express 5
- TypeScript (ESM)
- Prisma ORM
- MySQL 8.4
- Docker Compose
- bcrypt para senhas
- JWT Bearer para autenticacao
- Nodemailer + Gmail SMTP (recuperacao de senha)
- Multer + LongBlob do MySQL para banner de artigo
- Zod para validacao
- Vitest + @vitest/coverage-v8 para testes

## Sumario

- [Requisitos](#requisitos)
- [Opcao A: Docker (recomendado)](#opcao-a-docker-recomendado)
- [Opcao B: Sem Docker (MySQL local + dump)](#opcao-b-sem-docker-mysql-local--dump)
- [Login pos-seed / dump](#login-pos-seed--dump)
- [Variaveis de ambiente](#variaveis-de-ambiente)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Scripts npm](#scripts-npm)
- [Testes](#testes)
- [Rotas](#rotas)
- [Banco de dados](#banco-de-dados)
- [Troubleshooting](#troubleshooting)
- [Exemplo de uso](#exemplo-de-uso)
- [Cobertura do case](#cobertura-do-case)

## Requisitos

Escolha um dos dois caminhos:

**Opcao A — Docker (mais simples):**
- Docker + Docker Compose

**Opcao B — Sem Docker (MySQL local):**
- Node.js 24 + npm
- MySQL 8.x instalado e rodando localmente
- Cliente `mysql` na linha de comando (vem junto com o servidor)

---

## Opcao A: Docker (recomendado)

Os defaults do `docker-compose.yml` ja funcionam sem nenhum setup. Basta clonar e subir:

```bash
docker compose up --build
```

O container `api` aplica as migrations do Prisma automaticamente no boot. A API fica disponivel em `http://localhost:3333`.

### Popular o banco

Existem duas formas, escolha uma:

**A1) Via seed** (gera dados a partir de `prisma/seed.ts` + imagens em `prisma/banners/`):

```bash
docker compose exec api npm run db:seed
```

**A2) Via dump SQL** (snapshot completo ja com banners, comentarios e usuarios):

```bash
docker compose down -v
docker compose up -d mysql
docker compose exec -T mysql sh -c "mysql -uroot -proot_password mind_blog" < database.sql
docker compose up -d api
```

O dump inclui a tabela `_prisma_migrations`, entao o `prisma migrate deploy` no boot da API reconhece tudo como aplicado e nao reexecuta nada.

---

## Opcao B: Sem Docker (MySQL local + dump)

Use este caminho quando ja tiver MySQL instalado na maquina e nao quiser depender do Docker.

### 1. Crie banco e usuario no MySQL local

Conecte como root e rode:

```sql
CREATE DATABASE mind_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mind_user'@'localhost' IDENTIFIED BY 'mind_password';
GRANT ALL PRIVILEGES ON mind_blog.* TO 'mind_user'@'localhost';
FLUSH PRIVILEGES;
```

> Pode customizar nome/senha — so lembre de refletir no `DATABASE_URL` do `.env` abaixo.

### 2. Carregue o dump

```bash
mysql -u mind_user -p mind_blog < database.sql
```

Senha: `mind_password` (ou a que voce definiu acima).

> O dump ja contem schema, dados, banners e o registro das migrations aplicadas. Nao precisa rodar `prisma migrate` nem `db:seed`.

### 3. Configure o `.env`

```bash
cp .env.example .env
```

O `.env.example` ja vem com `DATABASE_URL` apontando pra `localhost:3306` e as demais variaveis (JWT, SMTP) preenchidas. Se voce mudou nome/senha do banco no passo 1, ajuste o `DATABASE_URL` aqui.

### 4. Instale dependencias e suba a API

```bash
npm install
npm run prisma:generate
npm run dev
```

A API fica disponivel em `http://localhost:3333`.

> Se quiser comecar com o banco vazio em vez do dump, pule o passo 2 e rode `npm run prisma:deploy` (cria as tabelas) e opcionalmente `npm run db:seed` apos o passo 4.

---

## Login pos-seed / dump

| Campo | Valor |
|---|---|
| Email | `john@example.com` (admin) |
| Senha | `123456` |

Os outros 6 usuarios (Marie Smith, Pedro Costa, Ana Silva, Lucas Almeida, Fernanda Lima, Bruno Tavares) usam a mesma senha.

## Variaveis de ambiente

- **No Docker:** todas tem default no `docker-compose.yml`. O `.env` e opcional (a API ignora o arquivo dentro do container) — pra customizar, exporte no shell ou edite o `docker-compose.yml`.
- **Sem Docker:** copie `.env.example` para `.env`; o `dotenv` em `src/config/env.ts` carrega esse arquivo no boot.

| Var | Default (Docker) | Default (`.env.example`) | Descricao |
|---|---|---|---|
| `PORT` | `3333` | `3333` | Porta da API |
| `FRONTEND_URL` | `http://localhost:5173` | `http://localhost:5173` | Origem permitida por CORS e base do link de reset de senha |
| `DATABASE_URL` | `mysql://mind_user:mind_password@mysql:3306/mind_blog` | `mysql://mind_user:mind_password@localhost:3306/mind_blog` | Connection string do Prisma |
| `JWT_SECRET` | `change_this_secret_before_deploy` | idem | Segredo do JWT (trocar em producao) |
| `SMTP_HOST` | `smtp.gmail.com` | idem | Host SMTP |
| `SMTP_PORT` | `465` | idem | Porta SMTP |
| `SMTP_SECURE` | `true` | idem | `true` para TLS direto (porta 465) |
| `SMTP_USER` | (preenchido) | (preenchido) | Usuario SMTP |
| `SMTP_PASS` | (preenchido) | (preenchido) | App Password do Google (16 chars) |
| `SMTP_FROM` | `Mind Blog <no-reply@mindblog.local>` | idem | Header From dos emails |

Variaveis do MySQL no Docker (`MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`) tambem tem defaults parametrizados no compose.

> **App Password do Gmail:** o `SMTP_PASS` precisa ser uma App Password de 16 caracteres gerada em https://myaccount.google.com/apppasswords (exige 2FA ativo). A senha normal da conta nao funciona.

> ⚠️ A App Password do Gmail incluida por padrao sera **revogada apos o processo seletivo**. Se o fluxo de reset-password parar de funcionar, gere uma nova App Password em https://myaccount.google.com/apppasswords e atualize `SMTP_PASS` no `.env` ou no `docker-compose.yml`.

## Estrutura do projeto

Arquitetura em camadas: `controllers/` (HTTP) → `services/` (regras de negocio) → `repositories/` (Prisma) → `mappers/` (resposta). Cada camada e testada de forma isolada em `tests/`.

```
src/
  app.ts              # Express + middlewares + montagem de rotas
  server.ts           # entrypoint
  config/             # env, prisma client
  controllers/        # handlers HTTP (auth, article, comment, engagement, profile)
  services/           # regras de negocio
  repositories/       # acesso ao Prisma
  schemas/            # schemas Zod
  routes/             # routers Express
  middlewares/        # auth (JWT), upload (multer)
  mappers/            # serializacao pra resposta
  utils/              # mailer, resetToken, pagination, readingTime, requireUser
  errors/             # AppError + errorHandler
tests/
  setup.ts            # bootstrap do Vitest
  mappers/            # testes dos mappers
  middlewares/        # testes dos middlewares
  schemas/            # testes dos schemas Zod
  services/           # testes das regras de negocio
  utils/              # testes dos utilitarios
prisma/
  schema.prisma       # modelos
  migrations/         # historico Prisma
  seed.ts             # seed completo
  banners/            # imagens reais usadas pelo seed (PNG/JPEG/WebP)
database.sql          # dump completo (schema + dados + banners inline)
docker-compose.yml    # mysql + api, defaults sem .env
Dockerfile
```

ESM esta ativo (`"type": "module"`). Imports relativos usam extensao `.js` mesmo em fontes `.ts` — e.g. `import { env } from "./config/env.js"`.

## Scripts npm

```bash
npm run dev              # tsx watch src/server.ts
npm run build            # tsc -> dist/
npm start                # node dist/server.js
npm run typecheck        # tsc --noEmit
npm run prisma:generate  # gera o Prisma Client
npm run prisma:migrate   # prisma migrate dev (cria nova migration)
npm run prisma:deploy    # prisma migrate deploy (aplica em prod)
npm run db:seed          # roda prisma/seed.ts
npm test                 # roda toda a suite Vitest
npm run test:watch       # modo watch
npm run test:coverage    # relatorio de cobertura
```

## Testes

A suite usa **Vitest**. Os arquivos vivem em `tests/` espelhando a estrutura de `src/`:

- `tests/mappers/` — serializacao de Article, Comment, Profile.
- `tests/middlewares/` — `authenticate`, `optionalAuthenticate`, `upload`.
- `tests/schemas/` — schemas Zod usados nos controllers.
- `tests/services/` — regras de negocio (auth, article, engagement, bookmark, etc.).
- `tests/utils/` — `resetToken`, `pagination`, `readingTime`, `mailer`.

`tests/setup.ts` configura o ambiente (variaveis de teste e mocks globais). Os testes nao tocam o banco real — repositories sao mockados nos testes de service.

```bash
npm test                 # roda tudo uma vez
npm run test:watch       # re-roda ao salvar
npm run test:coverage    # gera relatorio em coverage/
```

## Rotas

### Health

- `GET /health`

### Autenticacao

| Metodo | Rota | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password }` |
| POST | `/auth/login` | — | `{ email, password }` |
| POST | `/auth/forgot-password` | — | `{ email }` |
| POST | `/auth/reset-password` | — | `{ token, password }` |
| GET | `/auth/me` | Bearer | — |

`POST /auth/forgot-password` sempre responde `200` com mensagem generica (anti-enumeration). Se o email existir, envia um link `${FRONTEND_URL}/resetar-senha/<token>` valido por 30 minutos. O token e gerado com `crypto.randomBytes(32)` e armazenado **apenas em hash sha256** no banco.

`POST /auth/reset-password` valida o token, atualiza a senha (bcrypt) e devolve `{ user, token }` no mesmo formato do login — o frontend ja faz auto-login.

### Artigos

| Metodo | Rota | Auth |
|---|---|---|
| GET | `/articles` | opcional |
| GET | `/articles/:id` | opcional |
| GET | `/articles/:id/banner` | — |
| GET | `/articles/categories` | — |
| POST | `/articles` | Bearer |
| PUT | `/articles/:id` | Bearer |
| DELETE | `/articles/:id` | Bearer |
| POST | `/articles/categories` | Bearer |
| PUT | `/articles/categories/:categoryId` | Bearer |
| DELETE | `/articles/categories/:categoryId` | Bearer |

Criacao e edicao usam `multipart/form-data`:

| Campo | Obrigatorio | Notas |
|---|---|---|
| `title` | sim | |
| `content` | sim | |
| `summary` | nao | ate 280 chars |
| `category` | nao | nome da categoria |
| `tags` | nao | string separada por virgula, limite de 8 |
| `banner` | nao | imagem (JPEG/PNG/WebP/GIF), ate 4 MB, salva como `LongBlob` |

A rota `GET /articles/:id/banner` retorna o binario com o `Content-Type` correto.

### Comentarios e engajamento

| Metodo | Rota | Auth |
|---|---|---|
| GET | `/articles/:id/comments` | — |
| POST | `/articles/:id/comments` | Bearer |
| POST | `/articles/:id/view` | — |
| POST | `/articles/:id/read` | opcional |
| GET | `/articles/:id/like` | — |
| POST | `/articles/:id/like` | Bearer |
| DELETE | `/articles/:id/like` | Bearer |

### Perfil

| Metodo | Rota | Auth |
|---|---|---|
| GET | `/profile/me` | Bearer |
| PUT | `/profile/me` | Bearer |
| GET | `/profile/me/dashboard` | Bearer |

`PUT /profile/me` aceita `name`, `bio`, `avatarUrl` e devolve `{ profile, token }` — o token e reemitido com o payload atualizado para que o frontend nao precise persistir o user em outro lugar alem do proprio JWT.

O payload do JWT carrega o user publico completo (`id`, `name`, `email`, `bio`, `avatarUrl`, `role`), entao o frontend pode hidratar o usuario sem armazenar dados sensiveis no `localStorage`.

## Banco de dados

- Schema em `prisma/schema.prisma`.
- Historico de migrations em `prisma/migrations/`.
- Dump completo (DDL + dados + blobs) em `database.sql`.
- Imagens usadas pelo seed em `prisma/banners/` — o seed detecta o MIME pelos magic bytes, entao o nome do arquivo pode ter qualquer extensao.

## Troubleshooting

| Sintoma | Causa provavel | Como resolver |
|---|---|---|
| `docker compose up` falha com `port 3306 already in use` | Outro MySQL ja escuta na porta padrao | `docker compose down` ou ajuste `MYSQL_PORT` no `docker-compose.yml` (e no `DATABASE_URL` se necessario) |
| `prisma migrate deploy` falha no boot do container `api` | Banco em estado inconsistente | `docker compose down -v` (apaga o volume do MySQL) e suba de novo |
| Email de reset nao chega | App Password do Gmail revogada ou bloqueada | Gere uma nova em https://myaccount.google.com/apppasswords, atualize `SMTP_PASS`, e verifique a pasta de spam |
| `GET /articles/:id/banner` retorna 404 | Artigo sem banner ou id errado | Confirme com `GET /articles/:id` se `bannerUrl` esta presente |
| Frontend nao consegue logar (CORS error) | `FRONTEND_URL` diferente da origem real | Ajuste `FRONTEND_URL` no `.env` ou no `docker-compose.yml` para casar com a URL do Vite (default `http://localhost:5173`) |

## Exemplo de uso

Login (retorna `token` Bearer):

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

Criar artigo com banner (multipart):

```bash
curl -X POST http://localhost:3333/articles \
  -H "Authorization: Bearer <SEU_TOKEN>" \
  -F "title=Meu primeiro artigo" \
  -F "summary=Resumo curto" \
  -F "content=Conteudo completo do artigo..." \
  -F "category=Tecnologia" \
  -F "tags=react,typescript,node" \
  -F "banner=@./caminho/para/banner.jpg"
```

Listar artigos (paginado, opcionalmente filtrando por categoria):

```bash
curl "http://localhost:3333/articles?page=1&perPage=10&categoryId=<UUID>"
```

## Cobertura do case

- Cadastro e login com bcrypt e JWT.
- CRUD autenticado de artigos vinculados ao autor logado.
- Datas de publicacao e alteracao por artigo.
- Banner salvo como BLOB e exposto via endpoint dedicado.
- Dump SQL no repositorio.
- Docker Compose com MySQL e API, **funciona sem .env** gracas aos defaults.
- Recursos extras: categorias, tags, comentarios, curtidas, contagem de views, registro de leitura, perfil com bio/avatar, dashboard com metricas reais, e **fluxo completo de recuperacao de senha por email com Gmail SMTP**.
