# fix(article-card): corrigir thumbnails borradas nos cards de notícia

**Data**: 16/09/2026
**Branch**: main

## O que foi alterado
Adicionada a prop `sizes` nos três usos do `next/image` em `ArticleCard.tsx` (variantes `feature`, `default` e `secondary`).

## Por que foi alterado
As imagens eram renderizadas com largura fluida via Tailwind (`w-full`, `sm:w-2/5`, etc.), mas o `next/image` recebia apenas `width`/`height` fixos e nenhuma prop `sizes`. Sem `sizes`, o Next.js trata a imagem como tamanho fixo e gera o `srcset` só para essa largura em 1x/2x. Em telas largas, o elemento renderizado ficava maior que a imagem otimizada disponível, e o navegador esticava essa imagem de baixa resolução — daí o efeito borrado, mais visível no hero (`feature`) e no card padrão (`default`).

## Arquivos modificados
- `apps/web/src/app/(frontend)/_components/ArticleCard.tsx` — adicionado `sizes="100vw"` na variante `feature`, `sizes="(min-width: 640px) 40vw, 100vw"` na `default` e `sizes="96px"` na `secondary`, para o Next gerar/servir imagens em resolução compatível com o tamanho real renderizado.

## Como testar
1. Rodar `pnpm --filter web dev` e abrir a home em uma tela larga (>1280px)
2. Observar os cards de notícia (padrão e hero): as thumbnails devem estar nítidas, sem esticamento visível
3. Inspecionar a tag `<img>` gerada e conferir que o `srcset` inclui larguras maiores (ex: 1200w, 1920w) proporcionais ao viewport

## Impacto
- [ ] Quebra compatibilidade com algo existente?
- [ ] Requer migration de banco?
- [ ] Requer variável de ambiente nova?
- [ ] Requer comunicar o time?
