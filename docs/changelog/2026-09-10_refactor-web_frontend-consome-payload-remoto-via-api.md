# refactor(web): frontend passa a consumir o Payload remoto via API REST

**Data**: 10/09/2026
**Branch**: main

## O que foi alterado

Mudança de arquitetura de deploy: o CMS (Payload + Postgres) passa a rodar
inteiro numa VPS (`cms.claudim.com`), e a Vercel (`blog.claudim.com`) roda só
o frontend, que agora busca conteúdo pela API REST do Payload em vez da
Local API (que exige estar no mesmo processo).

- Novo `apps/web/src/lib/cms-client.ts`: cliente REST (`cmsFind`) e
  `resolveMediaUrl` (URLs de mídia relativas passam a apontar pro host do
  CMS, não pro host do frontend).
- `queries.ts` reescrito para usar `cmsFind` em vez de `payload.find` local.
  Removido `get-payload-client.ts` (não é mais usado).
- Componentes que exibem imagem de mídia (`ArticleCard`, `AuthorByline`,
  `AdSlot`, `TopBanner`, página de artigo) resolvem a URL via
  `resolveMediaUrl`.
- `NewsletterSubscribers`: o disparo do Domain Event `subscriber.registered`
  saiu da rota `/api/newsletter` e virou um hook `afterChange` na própria
  collection — o evento passa a nascer onde o dado é criado de verdade
  (o Payload da VPS), e não em quem chamou a API.
- `/api/newsletter` virou uma fachada fina: repassa pro Payload remoto e
  traduz o erro de validação REST em erros por campo.
- `next.config.ts`: `images.remotePatterns` aponta pro host de
  `PAYLOAD_CMS_URL`; `dangerouslyAllowLocalIP` só em dev (o próprio
  localhost é o "CMS remoto" nesse caso).
- `layout.tsx` (frontend) ganhou `export const dynamic = 'force-dynamic'`:
  as páginas não tentam mais buscar conteúdo durante o *build* da Vercel,
  só em tempo de requisição — o build não pode depender da VPS estar de pé.
- Removido o script `vercel-build` (rodava migration no build da Vercel, o
  que não faz mais sentido — a Vercel não toca mais no banco).

## Por que foi alterado

Decisão do usuário: já existia um Payload instalado numa VPS Hostinger: em
vez de duplicar CMS em dois lugares, o CMS de verdade (admin + Postgres)
fica só na VPS, e a Vercel vira puramente frontend.

## Arquivos modificados

- `apps/web/src/lib/cms-client.ts` (novo), `queries.ts`, `get-payload-client.ts` (removido)
- `apps/web/src/collections/NewsletterSubscribers.ts`
- `apps/web/src/app/(frontend)/api/newsletter/route.ts`
- `apps/web/src/app/(frontend)/layout.tsx`, `_components/{ArticleCard,AuthorByline,AdSlot,TopBanner}.tsx`
- `apps/web/next.config.ts`, `package.json`, `.env.example`
- `docs/payload-guide.md`

## Como testar

1. `pnpm dev` (o próprio app serve de CMS e de frontend em dev, via
   `PAYLOAD_CMS_URL=http://localhost:3000`)
2. Navegar home → seção → artigo público → artigo "membros" (corpo não deve
   aparecer no HTML)
3. Testar inscrição na newsletter (rejeita e-mail pessoal, aceita corporativo)
4. `pnpm typecheck` e `pnpm build` devem passar limpos

## Impacto

- [x] Quebra compatibilidade com algo existente? Sim — a Vercel não deve mais
      ter `DATABASE_URL` configurado (foi removido de lá); precisa de
      `PAYLOAD_CMS_URL` apontando pro Payload da VPS.
- [ ] Requer migration de banco? Não nesta mudança (schema não mudou).
- [x] Requer variável de ambiente nova? Sim — `PAYLOAD_CMS_URL`.
- [x] Requer comunicar o time? Sim — quem for rodar `pnpm dev` local não
      precisa mudar nada, mas quem mexer em deploy precisa saber da divisão
      VPS (CMS) / Vercel (frontend).
