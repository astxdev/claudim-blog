# fix(article-card): imagem do destaque preenche a altura do bloco nas editorias da home

**Data**: 18/09/2026
**Branch**: main

## O que foi alterado
A variante `feature` do `ArticleCard` deixou de usar uma imagem com proporção fixa e baixa (`aspect-[3/1]`/`sm:aspect-[46/10]`, herdada do estilo do hero carousel) e passou a usar `next/image` com `fill` dentro de um container que ocupa toda a altura disponível da coluna (`flex-1`), mantendo `aspect-square` só como fallback no mobile, onde as colunas empilham. Os containers que envolvem esse card na home (`page.tsx`) e na página de categoria (`[category]/page.tsx`) viraram `flex` para propagar a altura da linha do grid até a imagem.

## Por que foi alterado
Nas seções de editoria da home ("Processos", "Tecnologias" etc.) e na seção "Em destaque" da página de categoria, a matéria principal fica ao lado de uma lista de matérias secundárias mais alta. Como a imagem da matéria principal tinha proporção fixa e baixa, sobrava um espaço vazio entre ela e o rodapé do bloco, desalinhado com a coluna ao lado.

## Arquivos modificados
- `apps/web/src/app/(frontend)/_components/ArticleCard.tsx` — variante `feature`: container de imagem com `flex-1`/`fill` em vez de `width`/`height` fixos com aspect-ratio wide.
- `apps/web/src/app/(frontend)/page.tsx` — coluna do card em destaque das editorias virou `flex` para propagar altura.
- `apps/web/src/app/(frontend)/[category]/page.tsx` — mesma alteração na seção "Em destaque".

## Como testar
1. Rodar `pnpm --filter web dev` e abrir a home
2. Nas seções de editoria (ex: "Processos"), a imagem da matéria principal deve preencher toda a altura do bloco, alinhada com a base da lista de matérias secundárias ao lado, sem espaço vazio embaixo
3. Repetir a checagem na página de uma categoria (ex: `/processos`), na seção "Em destaque"

## Impacto
- [ ] Quebra compatibilidade com algo existente?
- [ ] Requer migration de banco?
- [ ] Requer variável de ambiente nova?
- [ ] Requer comunicar o time?
