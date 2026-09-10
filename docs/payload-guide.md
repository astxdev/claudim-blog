# Guia do Payload no Claudim Blog

Este documento explica como o Payload CMS é usado neste projeto, como rodar tudo
localmente e como migrar para produção.

## 1. O que é um CMS headless (e por que o Payload)

Um CMS "tradicional" (WordPress, por exemplo) cuida do conteúdo **e** da
renderização das páginas ao mesmo tempo. Um CMS **headless** só cuida do
conteúdo — schema, banco de dados, upload de mídia, permissões, painel de
edição — e expõe tudo por API. Quem desenha e renderiza as páginas é o
frontend (aqui, o Next.js em `apps/web`).

O Payload é um CMS headless que roda **dentro** da sua própria aplicação
Next.js (não é um serviço à parte): ele adiciona rotas de admin, API REST e
GraphQL ao mesmo processo Next.js, e define o schema do conteúdo em código
TypeScript (as "collections"), não numa interface visual. Isso significa que:

- O schema do conteúdo (`Articles`, `Categories`, `Authors`...) vive versionado
  no seu repositório, em `apps/web/src/collections/`.
- Você pode consultar o conteúdo de duas formas: a **Local API**
  (`payload.find(...)`, usada quando o código que consulta roda no mesmo
  processo do Payload — sem round-trip de rede) ou a **API REST/GraphQL**
  (para um cliente externo, ex. um app mobile, ou — como é o nosso caso em
  produção — um frontend hospedado em outro lugar).

> **Importante neste projeto**: em produção, o mesmo código de
> `apps/web` roda em **dois lugares diferentes** — veja a seção 5.

## 2. Como este projeto está organizado

```
apps/web/src/collections/
  Users.ts               # login da equipe editorial (admin)
  Media.ts                # upload de imagens
  Categories.ts            # os 4 pilares fixos: tech, business, people, processes
  Tags.ts                  # tags livres
  Authors.ts               # autores/colunistas
  Articles.ts               # a matéria em si (título, corpo, categoria, accessLevel...)
  NewsletterSubscribers.ts  # inscritos na newsletter (criação pública, leitura só admin)
  Ads.ts                    # criativos de anúncio por slot
```

Regras de negócio (o que é um e-mail corporativo válido, o que é "conteúdo
membros", cálculo de tempo de leitura) **não** vivem nas collections — elas
importam de `@claudim/core`, que é TypeScript puro, sem nenhuma dependência do
Payload. Isso significa que essas regras podem ser testadas e reaproveitadas
sem subir um banco de dados.

O frontend (`apps/web/src/app/(frontend)/`) lê o conteúdo através de
`apps/web/src/lib/queries.ts`, que por sua vez usa `apps/web/src/lib/cms-client.ts`
— um cliente HTTP para a API REST do Payload, apontando para a URL definida em
`PAYLOAD_CMS_URL`. Nenhuma página do frontend fala com o Postgres diretamente.

## 3. Rodando localmente

Pré-requisito: Docker rodando (aqui usamos Colima, já configurado).

```bash
# na raiz do monorepo
docker compose up -d       # sobe o Postgres em localhost:5433
pnpm install
pnpm --filter @claudim/web seed   # popula categorias, autores e artigos de exemplo
pnpm dev                    # inicia o Next.js + Payload em http://localhost:3000
```

Na primeira vez, abra `http://localhost:3000/admin` — o Payload vai pedir para
você criar o primeiro usuário administrador (nome, e-mail, senha). Esse é o
seu login de equipe editorial, não tem relação com os inscritos da newsletter.

Depois de logado, o painel `/admin` tem uma seção por collection (Articles,
Categories, Authors...). É ali que a equipe editorial cria e edita matérias —
sem precisar mexer em código.

### Adicionar uma matéria pelo admin

1. `/admin/collections/articles/create`
2. Preencha título (o slug é gerado sozinho), dek, excerpt, escolha a imagem de
   capa, a categoria, os autores e escreva o corpo no editor.
3. Escolha `accessLevel`: `public` (todo mundo lê) ou `members` (só aparece um
   teaser + CTA de assinatura no site — não existe login de leitor no MVP).
4. Marque `featured` se quiser que ela apareça na faixa de capa da home.
5. Salve como Published (o campo `_status`, controlado pelo botão de
   publicar/rascunho no topo do formulário).

### Adicionar um campo novo numa collection

Edite o arquivo da collection (ex. `Articles.ts`), adicione o campo no array
`fields`, rode `pnpm --filter @claudim/web generate:types` para regenerar
`payload-types.ts`, e o TypeScript do frontend já sabe do campo novo.

## 4. Schema do banco: `push` (dev) vs migrations (produção)

Em desenvolvimento, o adapter Postgres do Payload sincroniza o schema do
banco automaticamente a cada mudança de collection ("push") — por isso você
nunca precisou rodar uma migration até agora. **Isso é ótimo para
desenvolvimento e perigoso para produção**: push pode gerar uma migração
destrutiva sem pedir confirmação num ambiente não-interativo.

Antes de ir para produção pela primeira vez (e a cada mudança de schema
depois disso):

```bash
pnpm --filter @claudim/web payload migrate:create   # gera um arquivo de migration a partir do schema atual
```

Isso cria um arquivo em `apps/web/src/migrations/` — commite esse arquivo.
Em produção, em vez de `push`, você roda:

```bash
pnpm --filter @claudim/web payload migrate
```

Outros comandos úteis: `migrate:status` (o que já rodou), `migrate:down`
(desfaz a última), `migrate:fresh` (recria o banco do zero — só em dev).

## 5. Deploy — arquitetura escolhida: CMS na VPS, frontend na Vercel

Diferente do "tudo num só lugar" do desenvolvimento local, em produção o
mesmo código de `apps/web` roda em **dois deploys separados** do mesmo
repositório, cada um com um papel:

```
┌────────────────────────┐        API REST         ┌──────────────────────────┐
│  cms.claudim.com (VPS)  │ ◄──────────────────────  │  blog.claudim.com (Vercel) │
│  apps/web + Postgres    │   fetch() server-side    │  apps/web (frontend)     │
│  = o CMS de verdade     │                          │  PAYLOAD_CMS_URL=cms...  │
│  admin em /admin        │                          │  sem DATABASE_URL        │
└────────────────────────┘                          └──────────────────────────┘
```

- **VPS (`cms.claudim.com`)**: roda o app completo — Payload, Postgres,
  admin, collections, migrations. É aqui que a equipe edita conteúdo
  (`/admin`) e que o banco de dados vive de verdade. Tem `DATABASE_URL` e
  `PAYLOAD_SECRET`.
- **Vercel (`blog.claudim.com`)**: roda o mesmo código, mas só usa as páginas
  do frontend. Elas buscam conteúdo pela API REST do Payload da VPS (variável
  `PAYLOAD_CMS_URL=https://cms.claudim.com`), nunca acessam o Postgres
  diretamente e **não precisam de `DATABASE_URL`**.

Por isso as páginas do frontend (`page.tsx`, `[category]/page.tsx`,
`[category]/[slug]/page.tsx`, e o `layout.tsx`) têm
`export const dynamic = 'force-dynamic'` — elas nunca tentam buscar conteúdo
durante o *build* da Vercel (que não pode depender da VPS estar de pé
naquele momento), só em tempo de requisição.

### Colocando a VPS no ar

1. Suba o Postgres (Docker, como já está em `docker-compose.yml`) e o próprio
   app (`pnpm build && pnpm start`, ou via Docker/PM2) apontando pro
   `DATABASE_URL` local dessa VPS.
2. Rode a migration nessa máquina: `pnpm --filter @claudim/web payload migrate`.
3. Configure um proxy reverso (nginx/Caddy) com HTTPS pra `cms.claudim.com`
   apontando pra porta do app.
4. Acesse `https://cms.claudim.com/admin` e crie o primeiro usuário — esse é
   o login da equipe editorial.
5. **Segurança do Postgres exposto à internet** (a Vercel não tem IP fixo de
   saída, então não dá pra restringir por IP): usuário dedicado com permissão
   só no banco do Claudim (nunca o superusuário), senha forte, `hostssl` no
   `pg_hba.conf` (TLS obrigatório), e considere `fail2ban` pra bloquear
   tentativas de força bruta.

### Colocando a Vercel no ar

1. Projeto na Vercel com **root directory** `apps/web` (monorepo pnpm —
   detectado automaticamente).
2. Variáveis de ambiente do projeto (Production):
   - `PAYLOAD_CMS_URL` → `https://cms.claudim.com`
   - `PAYLOAD_SECRET` → só é necessário porque o `payload.config.ts` é
     importado pelo bundle; não precisa ser o mesmo da VPS, e nenhuma rota
     do frontend chega a usá-lo de fato.
   - **Não configure `DATABASE_URL` aqui** — a Vercel nunca deve ter acesso
     direto ao banco.
3. Deploy. O domínio customizado (`blog.claudim.com`) só pode ser anexado ao
   projeto **depois** do primeiro deploy funcionar (a Vercel bloqueia anexar
   domínio a um projeto sem deploy de produção bem-sucedido).

### Alternativa mais simples (sem VPS)

Se um dia quiser simplificar e abrir mão do controle total sobre a
infraestrutura, dá pra rodar o app inteiro (CMS + frontend juntos) só na
Vercel, com um Postgres gerenciado (Neon/Supabase) — nesse caso
`PAYLOAD_CMS_URL` nem precisaria existir (o app usaria a Local API
novamente, como em desenvolvimento). Foi o caminho considerado antes de optar
pela VPS.

## 6. Referência rápida de comandos

| Comando | O que faz |
|---|---|
| `docker compose up -d` | sobe o Postgres local (porta 5433) |
| `pnpm dev` | roda o site + admin em localhost:3000 |
| `pnpm --filter @claudim/web seed` | popula conteúdo de exemplo |
| `pnpm --filter @claudim/web generate:types` | regenera `payload-types.ts` após mudar uma collection |
| `pnpm --filter @claudim/web payload migrate:create` | gera migration a partir do schema atual |
| `pnpm --filter @claudim/web payload migrate` | aplica migrations pendentes (produção) |
| `pnpm typecheck` | checa tipos em todos os pacotes do monorepo |
| `pnpm build` | build de produção do Next.js |

`PAYLOAD_CMS_URL` (em `.env`): de onde o frontend busca conteúdo. Em dev,
`http://localhost:3000` (este mesmo app). Na Vercel, `https://cms.claudim.com`.
