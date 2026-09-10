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
  (`payload.find(...)`, usada direto dentro de Server Components — sem round-trip
  de rede, é só uma chamada de função) ou a **API REST/GraphQL** (para um
  cliente externo, ex. um app mobile).

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
`apps/web/src/lib/queries.ts`, que usa a Local API do Payload
(`payload.find`, `payload.create`).

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

## 5. Deploy

Duas opções, ambas compatíveis com o que já existe no projeto:

### Opção A — Vercel + Postgres gerenciado (recomendado para começar)

1. Crie um banco Postgres gerenciado (Neon ou Supabase têm plano gratuito) e
   copie a connection string.
2. Importe o repositório na Vercel, apontando o **root directory** para
   `apps/web` (é um monorepo pnpm — a Vercel detecta workspaces automaticamente).
3. Configure as variáveis de ambiente do projeto na Vercel:
   - `DATABASE_URL` → a connection string do banco gerenciado
   - `PAYLOAD_SECRET` → uma string aleatória longa (gere com
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
     nunca reaproveite a do `.env` local)
4. Antes do primeiro deploy, rode `pnpm --filter @claudim/web payload migrate`
   apontando `DATABASE_URL` para o banco de produção (rode local, uma vez, ou
   como um passo de build).
5. Deploy. Acesse `/admin` no domínio de produção para criar o primeiro
   usuário admin de produção.

### Opção B — Self-host com Docker

O `docker-compose.yml` na raiz já sobe o Postgres; para produção você
adicionaria um segundo serviço para a própria aplicação Next.js (`apps/web`,
buildada com `pnpm build` e servida com `pnpm start`), com as mesmas variáveis
de ambiente do passo anterior. Essa rota dá mais controle, mas exige que você
mesmo cuide de HTTPS, backups do Postgres e deploy contínuo.

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
