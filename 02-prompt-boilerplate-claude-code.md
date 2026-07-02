# PROJECT ATLAS — Blog Structure Engine
## Documento 2 de 4: Prompt de Execução (Boilerplate)

> **Instrução para o Claude Code:** este documento é para você executar, não apenas ler. Siga os passos na ordem. Ao final de cada etapa, rode o comando de verificação indicado antes de seguir para a próxima. Se algo falhar, corrija antes de continuar — não pule etapas.

Pré-requisito: já ter lido o Documento 1 (arquitetura-atlas-blog.md) nesta mesma pasta.

---

## Etapa 1 — Criar o projeto base

```bash
npx create-next-app@latest atlas-blog --typescript --tailwind --app --no-src-dir
cd atlas-blog
```

Verificação: rodar `npm run dev` e confirmar que a página padrão do Next.js carrega em `localhost:3000`.

---

## Etapa 2 — Criar os tipos e dados mock

Criar `/lib/types.ts` exatamente com os tipos definidos no Documento 1, seção 4.

Criar `/lib/mock-data.ts` com:
- 6 posts fake (pelo menos 3 categorias diferentes)
- 3 reviews fake
- 3 categorias

Criar `/config/site.config.ts` com:
- Nome do site (usar "Atlas Blog Demo" como placeholder)
- Menu: Home, Blog, Reviews, About, Contact
- As mesmas 3 categorias usadas em mock-data.ts

Verificação: os arquivos exportam os tipos/dados sem erro de TypeScript (`npx tsc --noEmit`).

---

## Etapa 3 — Componentes base

Criar em `/components`:
- `Header.tsx` — logo (texto do site.config), menu vindo de `site.config.ts`
- `Footer.tsx` — links para About, Contact, categorias
- `PostCard.tsx` — recebe um `Post` via props, mostra título, excerpt, categoria, link para `/post/[slug]`
- `ReviewCard.tsx` — recebe um `Review` via props, mostra nome do produto, rating, resumo, link para `/review/[slug]`
- `HeroSection.tsx` — seção de destaque da homepage (recebe título/subtítulo via props)
- `Breadcrumb.tsx` — recebe array de `{label, href}`
- `Pagination.tsx` — recebe `currentPage`, `totalPages`, `basePath`

Regra: nenhum destes componentes importa diretamente de `mock-data.ts`. Eles só recebem dados via props. Quem busca os dados são as páginas (`/app/**/page.tsx`).

Verificação: `npm run build` sem erros de tipo.

---

## Etapa 4 — Páginas e rotas

Implementar, nesta ordem, usando os componentes da Etapa 3:

1. `/app/page.tsx` — Homepage: Hero + lista dos posts mais recentes (PostCard) + lista de reviews em destaque
2. `/app/blog/page.tsx` — Archive: todos os posts paginados (usar Pagination)
3. `/app/post/[slug]/page.tsx` — Post individual: título, conteúdo, categoria, Breadcrumb
4. `/app/category/[slug]/page.tsx` — Lista posts filtrados por categoria
5. `/app/reviews/page.tsx` — Archive de reviews
6. `/app/review/[slug]/page.tsx` — Review individual com pros/cons
7. `/app/about/page.tsx` e `/app/contact/page.tsx` — páginas estáticas simples

Verificação: navegar manualmente (ou via `curl localhost:3000/...`) por todas as rotas acima e confirmar status 200 e conteúdo correto.

---

## Etapa 5 — Checklist final desta fase

Antes de considerar concluído, confirmar todos os itens do "Critério de sucesso" do Documento 1, seção 6.

Ao terminar, gerar um resumo curto do que foi feito e **parar**. Não iniciar configuração de Supabase, GitHub ou Vercel — isso está nos Documentos 3 e 4, que serão entregues depois.

---

## Observação sobre commits

Se o Git já estiver inicializado no projeto, fazer um commit ao final de cada etapa (1 a 5) com mensagem curta e descritiva (ex: `feat: componentes base do blog`). Isso facilita revisar o progresso depois. Não é necessário conectar a um repositório remoto ainda.
