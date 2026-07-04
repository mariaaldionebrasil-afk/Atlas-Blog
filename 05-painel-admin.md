# PROJECT ATLAS — Blog Structure Engine
## Documento 5 de 5: Painel Administrativo (/admin)

> **Instrução para o Claude Code:** os Documentos 1-4 já foram concluídos (boilerplate, E-E-A-T, headings, Supabase, deploy). Este documento adiciona um painel de administração interno. A Etapa 0 é manual (feita pela pessoa). As demais são para você executar, parando ao final de cada uma.

---

## Etapa 0 — Ação manual (feita pela pessoa)

1. Acessar https://aistudio.google.com
2. Fazer login com conta Google
3. Gerar uma API key gratuita (não precisa cartão de crédito para o tier gratuito de até 500 imagens/dia)
4. Guardar essa chave — será usada na Etapa 4

---

## Etapa 1 — Autenticação simples do painel

Objetivo: proteger `/admin` com login de 1 usuário (você), sem necessidade de sistema de usuários completo.

Implementar autenticação via **Supabase Auth** (já está no projeto, reaproveita a infraestrutura):

1. No painel do Supabase, ir em **Authentication → Users** e criar manualmente 1 usuário (seu e-mail + senha)
2. Criar `/app/admin/login/page.tsx` — formulário simples de e-mail/senha usando `supabase.auth.signInWithPassword()`
3. Criar middleware (`/middleware.ts`) que protege todas as rotas `/admin/**` exceto `/admin/login`, redirecionando para login se não houver sessão ativa
4. Criar botão de logout no painel

**Verificação:** tentar acessar `/admin` sem login redireciona para `/admin/login`. Login correto dá acesso. Logout funciona.

---

## Etapa 2 — Layout e navegação do painel

Criar `/app/admin/layout.tsx` com uma navegação lateral simples:

```text
- Dashboard (visão geral: quantidade de posts, reviews, rascunhos pendentes)
- Posts
- Reviews
- Categorias
- Autores
```

Criar `/app/admin/page.tsx` (Dashboard) mostrando esses números básicos.

**Verificação:** navegação funciona entre todas as seções, layout consistente.

---

## Etapa 3 — Atualizar schema: campo de status

No `schema.prisma`, adicionar campo de status em `Post` e `Review`:

```prisma
enum ContentStatus {
  DRAFT
  PUBLISHED
}
```

Adicionar `status ContentStatus @default(DRAFT)` em `Post` e `Review`.

Rodar `npx prisma migrate dev --name add_status`.

**Importante:** as páginas públicas (`/post/[slug]`, `/blog`, etc.) devem passar a filtrar `status: PUBLISHED` — rascunhos não podem aparecer no site público.

**Verificação:** migration aplicada sem erro. Criar um post de teste com status DRAFT direto no banco e confirmar que ele NÃO aparece em `/blog`.

---

## Etapa 4 — Geração de capa por IA (Nano Banana)

1. Instalar SDK: `npm install @google/genai`
2. Adicionar `GEMINI_API_KEY` no `.env.local` (valor gerado na Etapa 0)
3. Criar `/lib/generateImage.ts` — função que recebe um prompt de texto, chama o modelo `gemini-3.1-flash-image`, recebe a imagem gerada, e faz upload para um bucket do **Supabase Storage** (criar bucket `covers` se não existir), retornando a URL pública da imagem

**Verificação:** rodar um teste isolado (script simples) gerando 1 imagem de teste e confirmando que ela aparece no bucket do Supabase Storage.

---

## Etapa 5 — Formulários de Posts e Reviews

Criar `/app/admin/posts/page.tsx` (lista, com filtro por status) e `/app/admin/posts/[id]/page.tsx` (editar/criar).

Formulário de Post deve ter:
- Título, slug (gerado automaticamente do título, editável), excerpt, conteúdo (usar um editor de texto simples com Markdown — pode ser um `<textarea>` com preview, não precisa de editor rico complexo nesta fase)
- Seletor de categoria (dropdown)
- Seletor de autor (dropdown)
- Campo de imagem de capa: **dois botões** — "Gerar com IA" (abre campo de prompt, chama `generateImage.ts`) OU "Colar URL manual"
- Seletor de status: Rascunho / Publicado
- Botão Salvar

Repetir estrutura equivalente para `/app/admin/reviews/**`, incluindo os campos extras de Review (rating, pros, cons).

**Verificação:**
- Criar um post novo pelo painel, com imagem gerada por IA, status Rascunho → salvar → confirmar que aparece na lista mas NÃO no site público
- Mudar status para Publicado → confirmar que aparece no site público

---

## Etapa 6 — CRUD de Categorias e Autores

Criar `/app/admin/categories/**` e `/app/admin/authors/**` com formulários simples (nome, slug, descrição/bio, avatar para autores — pode reaproveisar o mesmo componente de "gerar com IA ou URL manual" para avatar).

**Verificação:** criar uma nova categoria pelo painel e confirmar que ela aparece disponível no seletor de categoria do formulário de Post.

---

## Checklist final do Documento 5

1. `/admin` protegido por login (Supabase Auth)
2. Dashboard mostra contagem de posts/reviews/rascunhos
3. Posts e Reviews têm fluxo Rascunho → Publicado funcionando
4. Site público nunca mostra conteúdo em rascunho
5. Geração de imagem por IA funcional, com upload automático pro Supabase Storage
6. Opção de URL manual também funciona como alternativa
7. CRUD de Categorias e Autores funcionando
8. `npm run build` sem erros
9. Commit e push de tudo, deploy automático na Vercel funcionando com as novas variáveis (`GEMINI_API_KEY` precisa ser adicionada nas Environment Variables da Vercel também)

Ao concluir, parar e apresentar o resumo.
