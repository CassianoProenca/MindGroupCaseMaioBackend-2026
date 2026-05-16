import { Prisma, PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

const transparentPng = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000100ffff03000006000557bfab5d0000000049454e44ae426082",
  "hex",
)

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function categoryConnect(name: string) {
  return {
    connectOrCreate: {
      where: { name },
      create: {
        name,
        slug: slugify(name),
      },
    },
  }
}

type UserSeed = {
  name: string
  email: string
  bio: string
  avatarUrl: string
  role: "ADMIN" | "AUTHOR"
}

const ADMIN: UserSeed = {
  name: "John Doe",
  email: "john@example.com",
  bio: "Desenvolvedor full stack e editor do TechBlog. Escreve sobre arquitetura, seguranca e produtividade.",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  role: "ADMIN",
}

const AUTHORS: UserSeed[] = [
  {
    name: "Marie Smith",
    email: "marie@example.com",
    bio: "Front-end engineer apaixonada por design systems e acessibilidade.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    role: "AUTHOR",
  },
  {
    name: "Pedro Costa",
    email: "pedro@example.com",
    bio: "Backend developer focado em observabilidade e arquitetura distribuida.",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    role: "AUTHOR",
  },
  {
    name: "Ana Silva",
    email: "ana@example.com",
    bio: "Product designer com background em pesquisa qualitativa.",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    role: "AUTHOR",
  },
  {
    name: "Lucas Almeida",
    email: "lucas@example.com",
    bio: "Engenheiro backend, fa de Go, Rust e bancos relacionais.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    role: "AUTHOR",
  },
  {
    name: "Fernanda Lima",
    email: "fernanda@example.com",
    bio: "Data engineer e curiosa sobre LLMs aplicados ao mundo real.",
    avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
    role: "AUTHOR",
  },
  {
    name: "Bruno Tavares",
    email: "bruno@example.com",
    bio: "SRE e DevOps engineer. Adora pipelines previsiveis e logs estruturados.",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
    role: "AUTHOR",
  },
]

type ArticleSeed = {
  title: string
  summary: string
  category: string
  tags: string[]
  viewsCount: number
  likesCount: number
  content: string
}

const ARTICLES: ArticleSeed[] = [
  {
    title: "IA Generativa: Como Modelos Transformam a Industria",
    summary: "Uma visao pratica de onde modelos generativos ja entregam valor e onde ainda tropecam dentro de produtos serios.",
    category: "Inteligencia Artificial",
    tags: ["IA", "LLM", "Produto"],
    viewsCount: 1280,
    likesCount: 47,
    content: `A inteligencia artificial generativa deixou de ser tema academico para virar componente central em produtos de todo porte. Modelos como GPT-4, Claude e Gemini estao integrados a editores de codigo, atendimentos de suporte, ferramentas de design e ate decisoes financeiras. Para times de tecnologia, ignorar essa onda nao e mais uma opcao razoavel.

## Como esses modelos realmente funcionam

Sob a superficie, um modelo generativo e um sistema estatistico que aprendeu a prever a proxima parte de uma sequencia. Treinado em terabytes de texto, ele captura relacoes entre palavras, conceitos e ate raciocinios complexos. Quando voce envia um prompt, o modelo nao consulta um banco de dados pronto, ele gera uma resposta nova a cada vez, baseada em probabilidades aprendidas durante o treinamento.

Essa caracteristica e fonte tanto da forca quanto da fraqueza desses sistemas. A forca esta na criatividade aparente e na capacidade de adaptar respostas ao contexto. A fraqueza esta na inconsistencia, ja que o mesmo prompt pode gerar respostas diferentes, e o modelo nao distingue claramente o que ele sabe do que ele esta apenas chutando.

## Aplicacoes que ja deram resultados mensuraveis

Geracao de codigo virou ferramenta diaria em muitos times. Copilots como GitHub Copilot e Cursor reduzem boilerplate, sugerem implementacoes de funcoes inteiras e aceleram a exploracao de bibliotecas novas. Estudos internos do GitHub apontam ganhos de produtividade entre 30 e 55 por cento em tarefas especificas, especialmente em codigo repetitivo ou em linguagens menos familiares.

Atendimento ao cliente passou por uma revolucao silenciosa. Modelos generativos hoje fazem triagem de nivel um com qualidade suficiente para resolver casos comuns sem intervencao humana. Empresas como Klarna reportam atender milhares de chamados por dia com IA, liberando humanos para casos que exigem julgamento, empatia ou negociacao.

Equipes de marketing usam IA para gerar variacoes de copy, testar hipoteses e personalizar campanhas em escala. Designers usam ferramentas como Midjourney e Stable Diffusion para criar mockups, ilustracoes e materiais visuais em minutos, nao dias.

## Onde a tecnologia ainda tropeca

O maior risco hoje e o excesso de confianca nos resultados. Modelos alucinam fatos, citam fontes que nao existem e cometem erros sutis em raciocinios longos. Sem revisao humana ou guardrails automatizados, isso vira problema legal e reputacional rapido. Casos famosos de advogados citando jurisprudencia inventada por IA ilustram bem o ponto.

A latencia tambem e um desafio em aplicacoes em tempo real. Modelos grandes podem levar segundos para responder, o que limita seu uso em fluxos interativos onde cada milissegundo importa. Tecnicas como streaming, modelos menores especializados e caching ajudam, mas exigem trabalho de engenharia.

Custos sao o terceiro grande ponto. Treinar um modelo do zero esta fora do alcance da maioria das empresas, e ate inferencia em modelos grandes pode custar centenas de dolares por dia em volumes altos. A estrategia certa quase sempre passa por usar APIs de provedores especializados, com cache e prompts otimizados.

## O que muda no dia a dia dos times

IA generativa nao substitui equipes, mas redefine o que cada pessoa entrega. Quem aprende a colaborar com esses modelos consegue dobrar a producao em tarefas repetitivas e ganha tempo para focar em problemas dificeis. O segredo esta em escolher bem onde aplicar e onde manter o controle humano explicito.

Para liderancas tecnicas, vale investir em formacao do time, em ferramentas que integrem IA aos fluxos existentes e em politicas claras de uso. Para desenvolvedores, vale experimentar com diferentes modelos, identificar pontos de alavanca reais e nao tratar IA como caixa preta.

A proxima geracao de produtos provavelmente vai ter IA integrada por padrao, da mesma forma que hoje todo produto serio tem busca, autenticacao e analytics. Quem entender isso primeiro tera vantagem competitiva real.`,
  },
  {
    title: "Seguranca em APIs REST: Boas Praticas Essenciais",
    summary: "Um guia objetivo dos cuidados de seguranca que toda API REST publica deveria adotar antes de subir para producao.",
    category: "Seguranca",
    tags: ["Seguranca", "API", "OWASP"],
    viewsCount: 940,
    likesCount: 31,
    content: `Toda API exposta na internet e um alvo. Bots automatizados varrem a web procurando endpoints abertos, credenciais expostas e versoes vulneraveis. Manter uma API segura nao e questao de paranoia, e parte basica da entrega. Felizmente, a maior parte dos cuidados sao previsiveis e podem ser tratados com poucas camadas bem desenhadas.

## Autenticacao: comece sempre por aqui

Toda rota que altera estado precisa de autenticacao. Toda rota que retorna dados sensiveis precisa de autenticacao. So expoem sem auth o que e genuinamente publico, como listagens anonimas ou conteudo de marketing. Em duvida, exija token.

JWT continua sendo a escolha mais comum para APIs stateless. Assine com chave forte, defina expiracao curta (idealmente abaixo de 24 horas) e rotacione o secret periodicamente. Nunca coloque dados sensiveis dentro do payload, ja que JWT e codificado, nao criptografado por padrao.

Para sessoes web, considere cookies http-only e secure com SameSite. Eles eliminam a maior parte dos ataques XSS porque o JavaScript no navegador nao consegue ler o token. A complexidade extra compensa.

## Autorizacao: nao confunda com autenticacao

Saber quem o usuario e (autenticacao) e diferente de saber o que ele pode fazer (autorizacao). Toda rota com auth precisa validar tambem o escopo. Um usuario logado nao pode editar artigos de outros, deletar comentarios alheios ou ver dashboard de outra organizacao.

A regra geral e fail closed: por padrao nega tudo, e adiciona permissoes explicitas. Verifique ownership a cada operacao critica e nao confie em IDs vindos do client. Sempre cruze com a sessao do usuario autenticado.

## Validacao de entrada: a maior fonte de bugs

Entradas nao validadas sao a porta de entrada de SQL injection, XSS, deserialization attacks e mil outros problemas. Use uma biblioteca de validacao em todos os handlers (Zod, Joi, Yup). Defina os schemas com tipos estritos, comprimentos maximos, formatos esperados.

Atencao especial para uploads de arquivos: limite tamanho, tipo MIME, extensao e idealmente passe o binario por um scanner antes de armazenar. Banner image de quatro megabytes parece razoavel ate alguem subir um pdf disfarcado.

## Rate limiting e proteccao contra abuso

Sem rate limit, qualquer endpoint vira vetor para ataque de forca bruta ou negacao de servico. Use express-rate-limit ou solucoes equivalentes, comece restritivo e relaxa conforme observar uso real. Login e endpoints de envio de email merecem limites mais agressivos.

Considere tambem CAPTCHA em rotas publicas que aceitam input do usuario, como cadastro e recuperacao de senha. A inconveniencia para o usuario legitimo e baixa, e o impacto em bots e enorme.

## Logs e monitoramento

Logs estruturados em JSON sao seu radar contra ataques em andamento. Registre tentativas de login falhadas, requests bloqueadas por rate limit, erros 4xx e 5xx em massa. Mas nunca logue senhas, tokens ou dados sensiveis em texto plano.

Monitore picos anomalos: dez mil requests em um minuto para o endpoint de login indica ataque. Configure alertas para essas situacoes e tenha um plano de resposta documentado.

## Senhas e criptografia

Senhas no banco sempre em hash com algoritmo apropriado para senhas (bcrypt, argon2, scrypt). Nao use MD5 ou SHA simples, eles foram desenhados para serem rapidos e nao para senhas. Bcrypt com fator de custo 10 a 12 e padrao confortavel.

Para dados sensiveis em transito, HTTPS sempre. Para dados sensiveis em repouso, criptografe colunas especificas (PII, tokens externos, chaves de API) com KMS ou solucao equivalente. Nao reinvente roda criptografica.

## CORS configurado, nao desabilitado

Liberar CORS pra qualquer origem (origin asterisco) e tentador durante o desenvolvimento, mas perigoso em producao. Defina explicitamente quais dominios podem chamar sua API e mantenha essa lista pequena.

## Headers de seguranca

Use helmet ou equivalente para adicionar headers como X-Frame-Options, X-Content-Type-Options e Content-Security-Policy. Eles sao baratos e mitigam classes inteiras de ataques no browser.

## Conclusao

Seguranca em API e disciplina, nao genialidade. As ferramentas existem, os padroes estao documentados (OWASP API Security Top 10 e excelente leitura). O que falta na maioria dos projetos e tempo dedicado a esses ajustes antes do go-live. Reserve uma sprint para isso e durma melhor.`,
  },
  {
    title: "Arquitetura Hexagonal: Separando Negocio de Infraestrutura",
    summary: "Como organizar o codigo para que a logica de negocio sobreviva a mudancas de framework, banco ou protocolo.",
    category: "Arquitetura",
    tags: ["Arquitetura", "DDD", "Clean Code"],
    viewsCount: 670,
    likesCount: 22,
    content: `Voce ja se viu reescrevendo metade do projeto porque o time decidiu trocar o ORM, ou porque o banco precisou virar PostgreSQL no lugar de MySQL? Boa parte desse retrabalho vem de um problema arquitetural conhecido: misturar regras de negocio com detalhes de infraestrutura.

## A ideia central

A arquitetura hexagonal, tambem chamada de ports and adapters, foi proposta por Alistair Cockburn no inicio dos anos dois mil. A premissa e simples: a logica de negocio fica no centro, isolada, e tudo que e externo (banco, API, fila, UI) conversa com ela atraves de interfaces bem definidas, chamadas de portas.

Cada porta tem uma ou mais implementacoes concretas, os adaptadores. Trocar o banco vira trocar um adaptador. Trocar o framework HTTP vira trocar outro adaptador. A logica de negocio nao precisa saber que existem requests, conexoes TCP ou tabelas SQL.

## Como isso se parece em codigo

Imagine um caso de uso de criar artigo. No estilo tradicional, o controller recebe o request, chama o ORM diretamente, faz validacoes, manda email e responde. Tudo acoplado.

No estilo hexagonal, o controller (adaptador HTTP de entrada) recebe o request e chama um caso de uso. O caso de uso recebe interfaces de repositorio e de notificador. Ele faz as validacoes de negocio e usa as interfaces para persistir e notificar. As implementacoes concretas (PrismaArticleRepository, MailgunNotifier) sao injetadas no startup da aplicacao.

A diferenca pratica e que o caso de uso pode ser testado sem subir banco, sem mockar HTTP e sem dependencias externas. Voce instancia as fakes das interfaces, chama o metodo, verifica o resultado. Testes ficam rapidos e legiveis.

## Onde vale a pena adotar

A arquitetura hexagonal brilha em projetos de medio para grande porte, onde a logica de negocio e complexa e tende a viver por anos. Em CRUDs simples, ela adiciona indirecao desnecessaria.

Outro sinal verde e quando o time precisa de testes confiaveis. Separar negocio de infraestrutura torna possivel testar 90 por cento da logica sem tocar em servicos externos, o que reduz drasticamente flakiness e tempo de execucao.

## Onde nao vale

Se o projeto e um prototipo, se o time tem dois desenvolvedores e tres meses para lancar, ou se a maior parte da logica e validacao trivial e CRUD, hexagonal pode virar overhead. A regra geral e: adote complexidade quando a complexidade do negocio justifica.

Tambem vale lembrar que arquitetura hexagonal nao e bala de prata. Voce ainda precisa pensar em consistencia, transacoes, performance e operacao. Ela so resolve o problema de acoplamento, nao todos os outros.

## Armadilhas comuns

A mais classica e criar interfaces para tudo, incluindo coisas que so tem uma implementacao e nunca terao outra. Isso vira ruido. Crie interface quando ha valor real em isolar.

Outra armadilha e vazar conceitos de infraestrutura para dentro do dominio. Se sua entidade Article tem uma propriedade prismaId, voce errou. Se seu caso de uso recebe Request do Express como parametro, voce errou. O dominio nao deve conhecer Express, Prisma ou qualquer biblioteca externa.

## Conclusao

Arquitetura hexagonal e uma ferramenta poderosa para times que precisam manter projetos por muito tempo, ou para casos onde a logica de negocio e o ativo principal. Aplicada com bom senso, ela reduz custo de manutencao, melhora qualidade de testes e torna o codigo mais resistente a mudancas de tecnologia. Aplicada sem criterio, adiciona indirecao que ninguem entende. Como sempre em engenharia, contexto e tudo.`,
  },
  {
    title: "TypeScript no Backend: Por Que Adotar em 2026",
    summary: "Os ganhos concretos de usar TypeScript em servicos Node.js, alem dos cuidados para nao virar barreira de produtividade.",
    category: "Desenvolvimento",
    tags: ["TypeScript", "Node.js", "Backend"],
    viewsCount: 1140,
    likesCount: 38,
    content: `TypeScript saiu do nicho de paixao de devs front-end e se consolidou como padrao em backends Node.js modernos. Praticamente todo projeto novo que merece atencao em 2026 ja nasce com TypeScript. Ainda assim, muita gente questiona se vale a pena migrar projetos existentes ou se isso e modismo.

## O ganho mais imediato: feedback no editor

A primeira coisa que voce nota ao escrever TypeScript e o autocomplete. O editor sabe exatamente quais propriedades existem em cada objeto, quais argumentos uma funcao aceita e o que ela retorna. Refatoracoes basicas (renomear funcao, mudar assinatura, extrair tipo) viram seguras e instantaneas.

Em projetos com cinquenta arquivos, esse ganho ja paga o esforco da adocao. Em projetos com quinhentos arquivos, ele e a diferenca entre saber e adivinhar.

## Erros pegos em tempo de compilacao

Bugs de tipo em JavaScript so aparecem em runtime, geralmente em producao. Tentativa de chamar metodo em undefined, acessar propriedade que nao existe, passar string onde se esperava numero. TypeScript pega tudo isso antes do codigo rodar.

Para APIs, o ganho e ainda maior. Definindo schemas Zod ou similares, voce garante que a forma do que entra e sai esta correta. Combinando com tipos derivados, o codigo passa a refletir o contrato real e nunca sai de sincronia.

## O custo: configuracao e curva inicial

TypeScript adiciona um passo de build. Em desenvolvimento, ferramentas como tsx ou ts-node lidam com isso de forma transparente, mas em producao voce precisa compilar para JavaScript. tsconfig.json tem dezenas de opcoes, e escolher bem leva algum tempo.

A curva de aprendizado para devs vindos de JavaScript puro nao e brutal, mas exige paciencia. Conceitos como generics, conditional types e mapped types levam meses para internalizar. A boa noticia e que o dia a dia raramente precisa do TypeScript avancado.

## Cuidados para nao virar burocracia

A grande armadilha do TypeScript e usar any para sair de problemas dificeis. Cada any adicionado e um buraco no sistema de tipos. Se voce nao consegue tipar algo direito, geralmente significa que o codigo esta confuso. Aproveite para refatorar.

Outro cuidado: nao crie tipos por crear tipos. Tipos devem refletir contratos significativos do dominio. Se um type apenas duplica o que o codigo ja diz, ele adiciona ruido sem agregar valor.

E evite arquiteturas onde voce precisa fazer cinco saltos de tipo para entender o que uma funcao recebe. Tipos devem ajudar a leitura, nao atrapalhar.

## ESM, strict mode e configuracoes recomendadas

Para projetos novos, comece com module ESM e strict true. Isso pega 95 por cento dos casos onde TypeScript ajuda de verdade. Adicione noUncheckedIndexedAccess se quiser pegar acessos a arrays e objetos como possiveis undefined.

Use exactOptionalPropertyTypes se quiser ser rigoroso com diferenca entre propriedade ausente e propriedade definida como undefined. Para a maior parte dos projetos, nao e necessario.

## Conclusao

TypeScript no backend nao e questao de hype. E uma ferramenta madura que entrega ganhos mensuraveis em produtividade, qualidade e manutencao. Para projetos novos, e quase obrigatorio. Para projetos antigos, migrar incrementalmente, arquivo por arquivo, costuma valer a pena, especialmente em areas de codigo que mudam com frequencia. O custo de aprender e baixo comparado ao retorno.`,
  },
  {
    title: "Observabilidade Moderna: Logs, Metricas e Traces",
    summary: "Como instrumentar um sistema distribuido para que voce descubra problemas antes do cliente reclamar.",
    category: "DevOps",
    tags: ["Observabilidade", "Monitoramento", "SRE"],
    viewsCount: 880,
    likesCount: 28,
    content: `Sistemas distribuidos falham de formas inesperadas. Servicos lentos cascateiam, deploys quebram dependencias invisiveis, bugs aparecem so sob carga real. A unica defesa eficaz contra isso e observabilidade, que e um termo mais amplo do que monitoramento tradicional.

## A diferenca entre monitorar e observar

Monitoramento e ter alertas para coisas que voce sabe que podem dar errado: CPU alta, disco cheio, erro 500. Observabilidade e ter dados suficientes para investigar problemas que voce nao previu. Quando o cliente liga dizendo que o checkout esta lento as quartas-feiras a tarde, voce quer poder responder, nao adivinhar.

Observabilidade se sustenta em tres pilares: logs, metricas e traces. Cada um responde a perguntas diferentes.

## Logs: o que aconteceu em detalhes

Logs sao eventos discretos. Em vez de print de string, prefira logs estruturados em JSON, com timestamp, nivel, mensagem, contexto e identificadores correlacionados. Bibliotecas como pino e winston facilitam essa estruturacao.

Inclua sempre que possivel um request id ou trace id em cada log. Isso permite reconstruir o caminho completo de uma requisicao atraves de varios servicos. Sem isso, debug distribuido vira jogar no escuro.

Evite logar dados sensiveis. Senhas, tokens, PII completa, numeros de cartao. Configure redaction explicito na sua biblioteca de logs.

## Metricas: o que esta acontecendo em escala

Metricas sao agregacoes numericas: contadores, gauges, histogramas. Elas respondem perguntas como qual a latencia p99 dessa rota, quantos erros 500 estao acontecendo agora, qual o consumo de memoria do servico ao longo do tempo.

Prometheus virou padrao de facto no ecossistema cloud-native. A combinacao com Grafana para dashboards e Alertmanager para alertas e poderosa e bem documentada. Para times menores, alternativas SaaS como Datadog, New Relic ou Honeycomb evitam manter infra propria.

Foque em SLIs (service level indicators) ao definir suas metricas: disponibilidade, latencia e taxa de erro sao bons pontos de partida. Em cima deles construa SLOs (service level objectives) e use error budget como guia para decisoes de risco.

## Traces: como uma requisicao atravessou o sistema

Distributed tracing mostra o ciclo completo de uma requisicao: passou pelo API gateway, chamou o servico A, que chamou o servico B, que consultou cache e banco. Cada span tem tempo, atributos e relacionamentos.

OpenTelemetry consolidou o ecossistema. Hoje voce instrumenta uma vez com OTel e exporta para o backend que preferir (Jaeger, Tempo, Datadog, Honeycomb). Em servicos Node.js, a auto-instrumentacao captura HTTP, banco e fila com poucas linhas de configuracao.

Use traces para responder duas perguntas chaves: onde esta o gargalo de latencia, e qual operacao em qual servico falhou e por que. Em microsservicos, traces sao a unica forma sane de investigar problemas em producao.

## Alertas que importam, e os que nao

Alertas excessivos viram ruido e ruido vira fadiga. Times com alert fatigue ignoram pages e perdem incidentes reais. A regra: so alerte sobre coisas que requerem acao humana imediata.

CPU alta nao e alerta, e dado. Latencia p99 acima do SLO por mais de cinco minutos e alerta. Disponibilidade caindo abaixo do SLO no orcamento do mes e alerta. Use a regra do USE (utilizacao, saturacao, erros) ou RED (rate, errors, duration) para estruturar.

## Custos: nem tudo precisa ser observado

Storage de logs e traces e caro em escala. Defina retencao apropriada, sample traces de operacoes de baixo valor, agregue logs verbosos antes de exportar. Times bem-sucedidos tratam observabilidade como produto, com orcamento e prioridades.

## Conclusao

Observabilidade nao e luxo, e o instrumento que separa times que reagem rapido dos que vivem em modo bombeiro. Investimento em logs estruturados, metricas com SLOs e traces distribuidos paga sozinho na primeira investigacao seria. Mais importante: comece simples, com algumas metricas e logs basicos, e amplie conforme a maturidade do time. Tentar implementar tudo de uma vez quase sempre falha.`,
  },
  {
    title: "CI/CD Pragmatico: Pipelines que Aceleram Times",
    summary: "Como desenhar pipelines de integracao e deploy continuos que tornam entregas previsiveis sem virar burocracia.",
    category: "DevOps",
    tags: ["CI/CD", "Deploy", "DevOps"],
    viewsCount: 720,
    likesCount: 26,
    content: `Pipeline de CI que demora vinte minutos para rodar testes vira inimigo do time. Deploy que exige rodar quinze comandos manuais nunca acontece nos horarios certos. Em ambos os casos, o problema nao e a ferramenta, e o desenho do processo.

## O que CI/CD bem feito entrega

Um pipeline saudavel da feedback em menos de cinco minutos para o desenvolvedor que abriu o pull request. Ele roda testes relevantes, lint, build e validacoes basicas de seguranca. Se tudo passa, o codigo esta pronto para entrar em main.

Deploy continuo significa que main em verde vai para producao sem intervencao manual, ou para um ambiente de staging que vai para producao com aprovacao explicita. A escolha entre os dois modos depende do contexto, mas o caminho ate la deve ser automatizado.

## Os erros mais comuns

O primeiro erro e tentar rodar todos os testes no pull request. Em projetos grandes, isso vira gargalo. Separe a suite em camadas: unitarios rapidos rodam sempre, integracao roda em main, end-to-end roda em batch noturno ou antes de deploy.

O segundo erro e nao falhar rapido. Se o lint quebrou, nao adianta esperar os testes. Configure jobs paralelos com dependencias claras, e cancele tudo na primeira falha.

O terceiro erro e dependencias frageis. Pipeline que falha porque o npm install demorou demais para resolver, ou porque o registry estava lento, gera distracao. Use lockfiles, cache aggressively e fixe versoes.

## Testes flaky: o cancer silencioso

Teste que falha de vez em quando e pior do que teste que nao existe. Ele ensina o time a ignorar falhas, e cedo ou tarde uma falha real vai passar batido. Quando identificar flaky, conserte ou remova imediatamente. Nao deixe rodar.

A causa mais comum de flakiness e dependencia de tempo ou ordem. Testes que assumem ordem de execucao, que dependem de clock real, que compartilham estado entre cases sao fragéis por design. Use mocks de tempo, isole estado, use unique IDs.

## Deploy: pequeno, frequente, reversivel

Deploy grande e raro e arriscado. Bug aparece, mas voce nao sabe qual mudanca causou. Rollback significa voltar dez features de uma vez. Times de alta performance preferem deploys pequenos, varias vezes por dia, com feature flags para ativar gradualmente.

Tenha sempre uma estrategia de rollback automatico baseada em metricas. Se taxa de erro disparou apos deploy, volta. Sem isso, deploy continuo vira ato de fe.

## Ferramentas

GitHub Actions, GitLab CI e CircleCI cobrem a maior parte dos casos. Para deploys, Argo CD, Spinnaker e Octopus sao opcoes maduras. Em ecossistemas Kubernetes, Flux e Argo CD para GitOps virou padrao.

Nao subestime o custo de manter sua propria infra de CI. Para a maioria dos times, SaaS resolve com qualidade superior e a um custo previsivel.

## Conclusao

CI/CD bem feito e a diferenca entre time que entrega com confianca e time que tem medo de fazer deploy as sextas-feiras. Investir em pipelines rapidos, testes confiaveis e deploys pequenos paga retorno todo dia. A regra geral: se o pipeline demora mais de dez minutos, ou se deploy exige reunido de aprovacao, e hora de revisar o processo.`,
  },
  {
    title: "Padroes de Cache: Quando, Onde e Como Aplicar",
    summary: "Os principais padroes de cache em sistemas distribuidos e as armadilhas que voce so descobre quando dados ficam errados.",
    category: "Arquitetura",
    tags: ["Cache", "Performance", "Arquitetura"],
    viewsCount: 590,
    likesCount: 19,
    content: `Cache e a optimizacao mais usada e mais mal usada em sistemas distribuidos. Aplicado certo, transforma performance e reduz custos. Aplicado errado, gera bugs sutis, dados desatualizados e debugging frustrante de madrugada.

## Por que cache funciona

A premissa basica e que dados acessados recentemente provavelmente serao acessados de novo em breve, e que armazenar copias proximas do consumidor reduz latencia drasticamente. RAM e mil vezes mais rapida que disco, cache em memoria proximo evita roundtrip de rede para banco.

Em escala web, cache e quase sempre o que separa o site que aguenta um pico de Black Friday do site que cai. Provedores como Cloudflare e Fastly mantem CDNs justamente para essa funcao.

## Niveis e onde aplicar

Cache acontece em varios niveis. Cache no browser (cache de assets estaticos, cache de respostas HTTP). Cache em CDN (proximo do usuario, para conteudo publico). Cache em camada de aplicacao (Redis, Memcached, em memoria local). Cache em camada de banco (query cache, materialized views).

A regra geral e aplicar cache o mais perto possivel do consumidor. Cache em CDN evita a aplicacao inteira. Cache em Redis evita o banco. Cache em memoria local evita a rede. Cada nivel tem seus tradeoffs em consistencia e capacidade.

## Padroes classicos

Cache aside e o mais comum. Aplicacao verifica cache primeiro, se nao tem, busca no banco e popula. Simples, funciona bem para read heavy workloads. Problema: cache miss da hot key pode causar thundering herd.

Read through delega a busca para o cache, que internamente busca no banco se nao tem. Reduz acoplamento da aplicacao com o cache, mas exige cache que suporte isso (alguns Redis clients abstraem).

Write through escreve no cache e no banco ao mesmo tempo. Garante consistencia, mas adiciona latencia em writes.

Write behind escreve so no cache, e periodicamente sincroniza com banco. Performance excelente, mas se cache cai antes da sincronizacao, voce perde dados.

## A armadilha da invalidacao

Phil Karlton resumiu bem: ha so duas coisas dificeis em ciencia da computacao, cache invalidation e nomear coisas. Saber quando expirar o cache e o problema mais comum em produção.

Estrategias possiveis. TTL fixo: cache expira apos N segundos. Simples, mas pode servir dado desatualizado por ate N segundos. Cache busting por chave: ao atualizar dado, invalida a chave correspondente. Funciona se voce sabe exatamente que chaves cachear. Versioning: chave inclui versao do dado, atualizacao gera nova versao. Cache antigo expira por TTL maior.

Para conteudo critico, TTL curto (alguns segundos) combinado com revalidacao explicita em writes e geralmente o mais seguro.

## Cache de objetos quentes (hot keys)

Quando uma chave tem trafego desproporcional (ex: usuario celebridade no Twitter), ela pode sobrecarregar o no Redis que armazena. Solucoes: replicacao da chave em varios nos, cache local em cada servico, ou redesign para evitar concentracao.

## Cuidado com cache stampede

Quando uma chave popular expira, todos os servicos consultando ao mesmo tempo viram um stampede no banco. Solucoes: lock distribuido para que so um regenere o cache enquanto outros aguardam, ou pre-warming agendado para chaves criticas.

## Cache e debugging

Bug em producao com cache no meio do caminho e dor de cabeca. O dado certo esta no banco, mas a aplicacao mostra valor antigo. Em vez de adicinar bash de logs em todo lugar, mantenha sempre uma forma de inspecionar o que esta no cache para uma chave especifica, e sempre tenha como invalidar manualmente em emergencia.

## Conclusao

Cache e ferramenta poderosa, mas come complexidade de retorno. Adote quando os ganhos sao mensuraveis e quando o time entende as implicacoes. Comece simples, monitore taxa de hit, identifique as hot keys e itere. Cache adicionado sem dados de uso real e cargo cult.`,
  },
  {
    title: "Threat Modeling: Pensando como um Atacante",
    summary: "Como aplicar threat modeling de forma pragmatica para identificar riscos antes que eles virem incidentes.",
    category: "Seguranca",
    tags: ["Seguranca", "Threat Modeling", "Arquitetura"],
    viewsCount: 510,
    likesCount: 17,
    content: `Threat modeling tem fama de ser exercicio caro, lento e que so grandes empresas fazem. Na pratica, e uma das tecnicas mais altas em retorno por hora investida. Bem aplicado, identifica vulnerabilidades em pontos onde nenhum scanner encontraria.

## O que e e o que nao e

Threat modeling e um exercicio estruturado de pensar sobre o que pode dar errado em um sistema, do ponto de vista de um adversario. Nao e um teste de penetracao, nao e uma auditoria, nao e um relatorio de compliance. E uma conversa, geralmente em equipe, sobre riscos.

O objetivo final e produzir uma lista de ameacas, com prioridades e mitigacoes propostas. Essa lista guia decisoes de arquitetura, prioridades de seguranca e ate desenho de testes.

## Quando fazer

A melhor hora e cedo: durante o desenho de uma feature nova ou de um sistema novo. Quanto mais cedo um problema for identificado, mais barato consertar. Mudar arquitetura no whiteboard custa zero, mudar em codigo legado custa caro.

Tambem vale revisar threat models periodicamente para sistemas em producao, especialmente apos mudancas significativas (nova integracao, mudanca de fornecedor, adicao de tipo novo de dado sensivel).

## Frameworks utileis

STRIDE e o mais conhecido, criado pela Microsoft. Para cada componente do sistema, voce considera seis categorias de ameaca: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege. E um checklist mental que evita esquecer categorias.

PASTA e mais elaborado e orientado a processo. Bom para empresas grandes com programa formal de seguranca.

Para o dia a dia, STRIDE com adaptacoes locais cobre bem. Documente em planilha simples ou ferramenta como OWASP Threat Dragon.

## Como conduzir uma sessao

Reuna o time tecnico do projeto (arquiteto, desenvolvedor senior, idealmente um sec eng). Comece com um diagrama de fluxo de dados de alto nivel: quais sao os atores, quais sao os fluxos de dados, onde estao as fronteiras de confianca.

Para cada componente e cada fluxo, percorra as seis categorias do STRIDE perguntando como um atacante pode atacar isso. Anote cada ameaca identificada, mesmo as obvias. Voce sempre descobre algumas que ninguem tinha pensado.

Apos a sessao, priorize as ameacas usando risco (impacto x probabilidade). Para cada alta, defina mitigacao concreta: codigo a escrever, configuracao a adicionar, teste a implementar.

## Exemplo concreto

Considere uma API que recebe upload de arquivos. Fluxo: usuario autenticado envia arquivo, API valida e armazena em bucket.

Spoofing: token de autenticacao roubado pode permitir upload em nome de outro usuario. Mitigacao: expiration curta, refresh seguro, logout efetivo.

Tampering: arquivo intercedido em transito pode ser alterado. Mitigacao: HTTPS obrigatorio.

Repudiation: usuario pode negar ter feito upload. Mitigacao: logs de auditoria com user, IP, timestamp.

Information Disclosure: arquivos de outros usuarios podem ser acessados via URL adivinhavel. Mitigacao: URLs com tokens curtos, autorizacao explicita por arquivo.

DoS: upload de arquivo gigante pode esgotar disco. Mitigacao: limite de tamanho na borda, rate limit por usuario.

Elevation of Privilege: usuario regular pode acessar arquivos de admin. Mitigacao: validacao de role em cada operacao.

Em quinze minutos voce identificou seis riscos concretos e mitigacoes para cada um.

## Erros a evitar

Tentar cobrir tudo de uma vez e a forma mais rapida de desistir. Comece pequeno, com um componente critico. Itere.

Tratar como exercicio teorico tambem nao funciona. As mitigacoes identificadas precisam virar tarefas no backlog, com responsavel e prazo. Sem isso, threat modeling vira teatro.

Por fim, nao fazer sozinho. Diversidade de perspectivas pega ameacas que uma so cabeca nunca pensaria.

## Conclusao

Threat modeling e uma das tecnicas mais subutilizadas em seguranca. Em poucas horas de discussao estruturada, voce identifica riscos que custariam meses para descobrir reativamente. Adote como pratica regular, mesmo informalmente, e veja a postura de seguranca do time amadurecer ao longo dos meses.`,
  },
  {
    title: "Microsservicos vs Monolitos Modulares: Trade-offs Reais",
    summary: "Quando microsservicos resolvem problemas reais e quando viram complexidade gratuita. Um comparativo honesto.",
    category: "Arquitetura",
    tags: ["Microsservicos", "Monolito", "Arquitetura"],
    viewsCount: 1320,
    likesCount: 42,
    content: `Microsservicos viraram default em muitos times sem que ninguem se perguntasse se valia a pena. O resultado e arquitetura distribuida com complexidade operacional alta e ganhos questionaveis. Nesse artigo, vamos examinar quando microsservicos realmente entregam valor e quando monolito modular continua sendo a melhor escolha.

## O que cada abordagem promete

Monolito tradicional: uma aplicacao unica, um repositorio, um deploy, um banco. Simples de desenvolver, simples de operar, simples de debugar. Atinge limites de escala quando o codigo cresce demais, quando varios times disputam o mesmo deploy ou quando partes do sistema tem requisitos muito diferentes.

Microsservicos: varios servicos pequenos, cada um com seu deploy, seu repositorio, possivelmente seu banco. Cada time controla seu pedaco. Permite escala independente, deploy independente, tecnologia diferente por servico. Custa complexidade operacional alta, comunicacao distribuida e desafios de consistencia.

Monolito modular: uma aplicacao unica, mas internamente dividida em modulos bem isolados, cada um com sua propria fronteira clara. Tem a maioria das vantagens do monolito tradicional, mas com possibilidade de migrar para microsservicos no futuro caso precise.

## Onde monolito vence

Times pequenos (ate vinte desenvolvedores) quase sempre vivem melhor com monolito. A sobrecarga de operar dez servicos distribuidos com cinco devs e dobrar carga de trabalho sem ganho proporcional.

Produtos novos, em fase de descoberta, mudam de forma imprevisivel. Monolito permite refatorar fronteiras conforme entendimento evolui. Em microsservicos, refatorar fronteira vira projeto de meses.

Sistemas com transacoes que cruzam dominios sao naturais em monolito. Em microsservicos, transacao distribuida vira saga, com complexidade exponencial.

## Onde microsservicos vencem

Quando voce tem muitos times trabalhando no mesmo produto, e cada time quer ter autonomia sobre seu pedaco, microsservicos resolvem coordenacao. Cada time deploya quando quer, escolhe sua tecnologia, atende seu time de produto.

Quando partes do sistema tem perfis de uso radicalmente diferentes (um servico que precisa de cem instancias, outro que roda em uma so), separar economiza infraestrutura.

Quando voce precisa escalar uma area especifica do produto independente do resto, microsservico permite. Em monolito, escalar tudo junto vira waste.

Quando partes do sistema precisam usar tecnologias diferentes por motivo legitimo (uma area de ML em Python, uma area transacional em Go, uma area de batch em Java), microsservicos viabilizam.

## O custo escondido de microsservicos

Comunicacao via rede e ordens de magnitude mais lenta e mais erratica que chamada de funcao. Latencia tipica de chamada local: nanosegundos. Latencia tipica de chamada HTTP: milissegundos. Em fluxos onde voce encadeia dez chamadas, isso vira problema serio.

Falhas parciais sao a regra. Servico A esta no ar, servico B caiu. O que A faz? Servico C respondeu mas demorou. A timeouta ou espera? Cada decisao multiplica casos de teste.

Observabilidade vira essencial. Sem distributed tracing, debug em microsservicos e adivinhacao. Sem metricas e logs centralizados, problemas demoram horas para serem localizados.

Deploy coordenado vira excecao gerenciada. Mudancas que afetam multiplos servicos exigem dancas cuidadosas: deploy backward-compatible, depois deploy da nova versao, depois cleanup. Cada um com seu PR e seu schedule.

## Monolito modular: o meio termo

Para a maioria dos times, monolito modular e a melhor escolha. Voce define modulos internos com fronteiras claras (pasta separada, namespace separado, idealmente sem importacoes cruzadas exceto via interfaces). Cada modulo poderia virar microsservico no futuro caso precise.

O ganho e que voce escreve codigo simples (chamada de funcao, nao HTTP), com testes simples (sem rede), e pode evoluir o desenho conforme aprende. Quando um modulo realmente precisar virar servico, voce ja tem a fronteira mapeada.

## Sinais de que e hora de extrair um servico

O modulo cresceu tanto que merece time proprio. O modulo tem requisitos de escala radicalmente diferentes do resto. O modulo precisa de stack diferente. O modulo tem ciclo de deploy diferente do resto (por compliance ou risco).

Sem pelo menos um desses sinais, extrair e prematuro.

## Conclusao

Nao escolha arquitetura por moda. Microsservicos resolvem problemas reais quando voce os tem, mas criam problemas novos quando voce nao tem. Para a maioria dos times brasileiros, monolito modular bem desenhado entrega mais valor com menos custo. Quando o crescimento justificar, extracoes pontuais resolvem casos especificos. Resista a impulso de comecar microsservicos por default.`,
  },
  {
    title: "LLMs em Producao: Custo, Latencia e Confiabilidade",
    summary: "Os desafios reais de levar modelos de linguagem para producao, alem dos demos impressionantes em ambiente controlado.",
    category: "Inteligencia Artificial",
    tags: ["LLM", "IA", "Producao"],
    viewsCount: 950,
    likesCount: 33,
    content: `Demos de LLM impressionam. Voce digita um prompt, recebe resposta inteligente, sente que esta vendo o futuro. Mas levar esse mesmo modelo para producao, atender milhares de usuarios com latencia previsivel e custo controlado, e outra historia. Esse artigo explora os desafios que aparecem alem do prototipo.

## O problema do custo

Inferencia em LLMs grandes nao e barata. Cada chamada para GPT-4 ou Claude Opus custa centavos por requisicao em volumes baixos, mas vira centenas de dolares por dia em volumes altos. Sem controle, custo de IA cresce mais rapido que receita.

Estrategias para reduzir custo:

Use modelos menores quando possivel. Para tarefas simples (classificacao, resumo curto), GPT-4o-mini ou Claude Haiku resolvem com fracao do custo. Reserve modelos grandes para tarefas que realmente precisam.

Cache respostas. Se o mesmo prompt chega frequentemente, cache. Mesmo respostas semanticamente similares podem ser detectadas e reutilizadas com tecnicas de embedding similarity.

Otimize prompts. Cada token enviado e cada token gerado custa. Prompts verbosos com instrucoes redundantes desperdicam tokens. Mensure e refatore.

Batch operacoes quando possivel. Algumas tarefas podem ser processadas em batch noturno, com tarifas reduzidas em muitos provedores.

## O problema da latencia

LLMs grandes nao sao rapidos. Resposta tipica de GPT-4 leva varios segundos para queries complexas. Em fluxos interativos, isso quebra a experiencia.

Solucoes:

Streaming. Em vez de esperar a resposta completa, transmita token por token enquanto e gerado. O usuario percebe muito mais responsivo, mesmo que o tempo total seja o mesmo.

Pre-computacao. Para conteudo previsivel (FAQ, recomendacoes), gere offline e sirva como conteudo estatico. Sem latencia de inferencia.

Modelos menores especializados. Em vez de chamar GPT-4 para classificar intencao do usuario, treine ou faca fine-tune de modelo menor para essa tarefa especifica. Latencia cai uma ordem de magnitude.

Roteamento inteligente. Use modelo leve para triagem, escalado para modelo grande so quando realmente necessario. Maioria das queries resolvem-se com modelo leve.

## O problema da confiabilidade

LLMs alucinam. Eles inventam fatos, citam fontes que nao existem, cometem erros logicos sutis. Em producao, isso vira problema real: usuario confia, decide com base em informacao errada, perde dinheiro ou tempo.

Tecnicas de mitigacao:

Retrieval Augmented Generation (RAG). Em vez de o modelo gerar do nada, voce primeiro busca documentos relevantes (sua base de conhecimento, manuais, FAQs) e passa como contexto. O modelo entao responde baseado em material verificavel.

Citacoes obrigatorias. Force o modelo a citar fonte de cada afirmacao. Se ele nao consegue, ele admite que nao sabe em vez de inventar.

Guardrails. Use outro modelo (ou regras) para validar resposta antes de entregar ao usuario. Detecte respostas potencialmente problematicas (toxicidade, vazamento de PII, alucinacao detectavel).

Human in the loop para acoes criticas. Decisoes irreversiveis (envio de email para cliente, transacao financeira, alteracao de dados importantes) sempre passam por revisao humana.

## Observabilidade especifica de LLM

Monitoramento tradicional nao basta. Voce precisa rastrear:

Latencia por modelo e por tipo de operacao.

Custo por usuario, por feature, por tipo de operacao.

Qualidade percebida (rate de feedback negativo, abandono, retentivas).

Distribuicao de prompts e respostas para detectar drift.

Ferramentas como LangSmith, Helicone e Honeycomb com integracao para LLM ajudam.

## Versionamento e migracao

Modelos evoluem. GPT-3.5 vira GPT-4, vira GPT-4o, vira GPT-5. Cada upgrade pode mudar comportamento sutil. Sem versionamento explicito, voce pode acordar com producao quebrada apos atualizacao silenciosa.

Pin versoes especificas. Teste novas versoes em paralelo antes de migrar. Mantenha capacidade de fallback para versao antiga em caso de problema.

## Conclusao

LLMs em producao exigem disciplina de engenharia que muitos times subestimam. Custo, latencia e confiabilidade sao problemas reais que nao aparecem em demos. Com as praticas certas (cache, streaming, RAG, observabilidade, versionamento), e perfeitamente possivel entregar produtos confiaveis. Mas tratar LLM como API magica que sempre funciona e receita para problemas em escala.`,
  },
]

const COMMENT_POOL = [
  "Otimo artigo, muito bem estruturado!",
  "Aprendi bastante, obrigado por compartilhar.",
  "Esses pontos sao exatamente o que estavamos discutindo no time esta semana.",
  "Mas e em casos de equipes muito pequenas? Voce acha que ainda vale a pena?",
  "Curti o equilibrio entre teoria e exemplo pratico.",
  "Trabalhei com isso recentemente e seu texto refletiu bem a realidade do dia a dia.",
  "Sinto falta de mais exemplos de codigo, mas a parte conceitual ficou impecavel.",
  "Topico que merece um aprofundamento. Tem indicacoes de leitura?",
  "Concordo em quase tudo, exceto na parte de tradeoffs com performance.",
  "Voce poderia comentar sobre o impacto disso em sistemas legados?",
  "Excelente material para apresentar para gestores nao tecnicos.",
  "Comecei a aplicar essas ideias no projeto atual e ja vi diferenca clara.",
  "Faltou cobrir o aspecto de custos, mas o resto esta otimo.",
  "Bem escrito. Vou compartilhar com o time amanha.",
  "Tenho duvidas sobre como isso escala em times distribuidos por varios fusos.",
  "Essa materia me ajudou a tomar uma decisao importante esta semana.",
  "Discordo do trecho sobre overengineering, vejo um cenario diferente nas empresas que ja trabalhei.",
  "Quanto tempo voce levou para mapear esses padroes na pratica?",
  "Voce considera que ferramentas open source sao competitivas nesse contexto?",
  "Topico denso, mas a explicacao deixou tudo bem mais claro.",
  "Bom resumo dos riscos. Vai ajudar a justificar as escolhas no proximo trimestre.",
  "Salvei nos favoritos. Material de referencia obrigatorio.",
  "Algumas das criticas eu ja tinha ouvido, mas voce articulou melhor que ninguem.",
  "Voce escreve em outras plataformas tambem? Quero acompanhar.",
  "Posso traduzir esse texto para compartilhar com o time internacional?",
  "Senti falta de uma comparacao direta com solucoes mais antigas.",
  "Apliquei algo parecido no passado, mas sem o framework certo. Faz toda diferenca.",
  "Daria um excelente conteudo para palestra. Pensa em apresentar em algum evento?",
  "Voce poderia falar mais sobre a estrategia de testes nesse cenario?",
  "A questao de manutencao a longo prazo sempre me preocupou nesses casos.",
  "Tem post pretendido sobre o assunto relacionado? Adoraria continuar a leitura.",
  "Conteudo de qualidade, parabens pelo trabalho!",
  "Discordo da conclusao final, mas o caminho ate ela e solido.",
  "Em casos especificos vejo problemas, mas a regra geral parece muito boa.",
  "Esse tipo de artigo eleva o nivel da comunidade tech brasileira.",
  "Vou usar isso como base para o proximo onboarding de devs juniores.",
  "Falar sobre os limites da abordagem foi diferencial. Muita gente esquece disso.",
  "Tem benchmarks reais para reforcar os argumentos numericamente?",
  "Algumas partes contradizem o que aprendi em outra fonte. Vou investigar com mais calma.",
  "Material super atual, obrigado por acompanhar a evolucao do tema.",
]

async function upsertUser(seed: UserSeed, passwordHash: string) {
  return prisma.user.upsert({
    where: { email: seed.email },
    update: {
      bio: seed.bio,
      avatarUrl: seed.avatarUrl,
      role: seed.role,
    },
    create: {
      name: seed.name,
      email: seed.email,
      passwordHash,
      bio: seed.bio,
      avatarUrl: seed.avatarUrl,
      role: seed.role,
    },
  })
}

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10)

  const admin = await upsertUser(ADMIN, passwordHash)

  const authors = []
  for (const seed of AUTHORS) {
    authors.push(await upsertUser(seed, passwordHash))
  }

  const allUsers = [admin, ...authors]

  await prisma.article.deleteMany({
    where: { authorId: admin.id },
  })

  const minute = 60 * 1000

  for (let articleIndex = 0; articleIndex < ARTICLES.length; articleIndex++) {
    const seed = ARTICLES[articleIndex]

    const article = await prisma.article.create({
      data: {
        title: seed.title,
        summary: seed.summary,
        category: categoryConnect(seed.category),
        content: seed.content,
        bannerImage: transparentPng,
        bannerMimeType: "image/png",
        viewsCount: seed.viewsCount,
        likesCount: seed.likesCount,
        author: {
          connect: { id: admin.id },
        },
        tags: {
          create: seed.tags.map((name) => ({
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

    const baseTimeMs = Date.now() - articleIndex * 6 * 60 * minute
    const comments: Prisma.CommentCreateManyInput[] = []

    for (let commentIndex = 0; commentIndex < 20; commentIndex++) {
      const templateIndex = (articleIndex * 7 + commentIndex * 3) % COMMENT_POOL.length
      const authorIndex = (articleIndex * 2 + commentIndex) % allUsers.length
      const ageMinutes = commentIndex * 47 + articleIndex * 13
      const createdAtMs = baseTimeMs - ageMinutes * minute

      comments.push({
        content: COMMENT_POOL[templateIndex],
        articleId: article.id,
        authorId: allUsers[authorIndex].id,
        createdAt: new Date(createdAtMs),
        updatedAt: new Date(createdAtMs),
      })
    }

    await prisma.comment.createMany({ data: comments })
  }
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
