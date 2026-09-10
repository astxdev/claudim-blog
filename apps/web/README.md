# Claudim Blog — apps/web

Frontend (Next.js App Router) e admin (Payload CMS) do portal Claudim.

## Início rápido

```bash
# na raiz do monorepo
docker compose up -d
pnpm install
pnpm --filter @claudim/web seed
pnpm dev
```

Abra `http://localhost:3000` para o site e `http://localhost:3000/admin` para
o painel do Payload (primeira vez: crie o usuário administrador na tela).

Guia completo de como o Payload é usado neste projeto, como adicionar
conteúdo/collections e como migrar para produção: [`docs/payload-guide.md`](../../docs/payload-guide.md).

## Estrutura

- `src/collections/` — schema do conteúdo (Payload)
- `src/app/(frontend)/` — site público (Next.js)
- `src/app/(payload)/` — admin e API do Payload (gerado pelo `@payloadcms/next`)
- `src/lib/` — camada de leitura do Payload usada pelas páginas
- `src/seed/` — script de conteúdo de exemplo
