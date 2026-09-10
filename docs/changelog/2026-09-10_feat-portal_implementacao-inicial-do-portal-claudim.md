# feat(portal): implementação inicial do portal Claudim

**Data**: 10/09/2026
**Branch**: main

## O que foi alterado

Primeira versão completa do portal Claudim: monorepo pnpm com `packages/core`
(regras de negócio puras), `packages/infra` (adapters de domain events) e
`apps/web` (Next.js 16 + Payload CMS 3, Postgres).

- **Payload**: coleções `Categories`, `Tags`, `Authors`, `Articles`,
  `NewsletterSubscribers` e `Ads`, registradas em `payload.config.ts`.
  Validação de inscrição na newsletter (e-mail corporativo, áreas de
  interesse) roda de verdade no servidor via `@claudim/core`.
- **Frontend**: home (capa + rio de matérias em tamanhos variados + boletim),
  página de seção por pilar editorial, página de artigo (compartilhamento,
  teaser bloqueado para conteúdo "membros", anúncio), barra de newsletter
  fixa (inline no desktop, folha em tela cheia no mobile), faixa de topo
  reservada para publicidade (com fallback para a imagem de capa da marca
  enquanto não há anunciante).
- **Design system**: tokens de cor extraídos da marca (`branding/`), tipografia
  serifada + sans, fundo branco, hairlines e categorias coloridas — estrutura
  inspirada em NYT/Economist.
- **Seed** de conteúdo de exemplo (`pnpm --filter @claudim/web seed`).
- **Documentação**: `docs/payload-guide.md` (como o Payload é usado, rodar
  local, migrations, deploy).

## Por que foi alterado

Construção do zero do produto solicitado: um portal de notícias sobre
tecnologia, negócios, pessoas e processos, com CMS headless e captura de
newsletter B2B.

## Arquivos modificados

- `packages/core/src/**` — regras de negócio (newsletter, nível de acesso,
  slug, tempo de leitura)
- `packages/infra/src/**` — handler do evento `subscriber.registered`
- `apps/web/src/collections/**` — schema do Payload
- `apps/web/src/app/(frontend)/**` — páginas e componentes do site
- `apps/web/src/lib/**` — camada de leitura do Payload
- `apps/web/src/seed/**` — conteúdo de exemplo
- `docs/payload-guide.md`, `docker-compose.yml`, `pnpm-workspace.yaml` — infra e documentação

## Como testar

1. `docker compose up -d && pnpm install && pnpm --filter @claudim/web seed && pnpm dev`
2. Abrir `http://localhost:3000` — navegar home → seção → artigo
3. Testar inscrição na newsletter com um e-mail pessoal (deve rejeitar) e um
   corporativo (deve aceitar)
4. `pnpm typecheck` e `pnpm build` devem passar limpos

## Impacto

- [ ] Quebra compatibilidade com algo existente? Não — projeto novo.
- [x] Requer migration de banco? Sim, na primeira vez em produção (ver
      `docs/payload-guide.md` § 4) — em dev o schema é sincronizado
      automaticamente.
- [x] Requer variável de ambiente nova? Sim — `DATABASE_URL` e
      `PAYLOAD_SECRET` (ver `apps/web/.env.example`).
- [ ] Requer comunicar o time? Não — ainda não há time além do autor.
