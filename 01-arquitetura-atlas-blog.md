# PROJECT ATLAS — Blog Structure Engine
## Documento 1 de 4: Arquitetura e Stack

> **Instrução para o Claude Code:** este documento descreve o projeto que vamos construir. Leia por completo antes de escrever qualquer código. Não implemente nada a partir deste documento sozinho — ele é contexto. A implementação real está no Documento 2 (prompt de boilerplate).

---

## 1. O que estamos construindo

Um **boilerplate de blog em Next.js**, componentizado e parametrizável, que sirva como base reutilizável para publicar blogs de conteúdo (informacional, review, comparação) com boa estrutura de SEO.

**Fora de escopo nesta fase (não implementar):**
- Geração automática de conteúdo em massa via IA
- Múltiplos blogs simultâneos / multi-tenant
- Dashboard administrativo
- Integração com AdSense/afiliados

Essas partes só entram depois que tivermos 1 blog completo, real e funcional.

---

## 2. Stack técnica (fixar estas escolhas, não substituir sem perguntar)

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js (App Router) | SSR, rotas dinâmicas, SEO nativo |
| Linguagem | TypeScript | Tipagem, escalabilidade |
| Estilo | Tailwind CSS | Componentização rápida |
| Banco de dados | Supabase (Postgres) | Entra na Fase 2, não agora |
| ORM | Prisma | Entra junto com o Supabase, Fase 2 |
| Versionamento | GitHub | Repositório remoto |
| Deploy | Vercel | Deploy automático via GitHub |

**Fase 1 (agora):** projeto roda 100% local, com dados mock em arquivos TypeScript/JSON — sem banco de dados ainda.

**Fase 2 (depois):** substituir os dados mock por Supabase + Prisma.

---

## 3. Estrutura de pastas alvo

```
/atlas-blog
  /app
    /page.tsx                → Homepage
    /blog/page.tsx           → Archive (lista de posts)
    /post/[slug]/page.tsx    → Post individual
    /category/[slug]/page.tsx → Página de categoria
    /reviews/page.tsx        → Archive de reviews
    /review/[slug]/page.tsx  → Review individual
    /about/page.tsx
    /contact/page.tsx
  /components
    Header.tsx
    Footer.tsx
    PostCard.tsx
    ReviewCard.tsx
    HeroSection.tsx
    Breadcrumb.tsx
    Pagination.tsx
  /lib
    mock-data.ts            → Dados fake (posts, categorias, reviews)
    types.ts                → Tipos TypeScript compartilhados
  /config
    site.config.ts           → Nome do site, menu, cores, categorias
  /public
    /images
```

---

## 4. Contrato de dados (types.ts)

Estes são os tipos mínimos que os componentes devem respeitar. Não inventar campos extras nesta fase.

```typescript
type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedDate: string;
  coverImage?: string;
};

type Review = {
  slug: string;
  productName: string;
  rating: number; // 0 a 5
  summary: string;
  content: string;
  pros: string[];
  cons: string[];
  coverImage?: string;
};

type Category = {
  slug: string;
  name: string;
  description?: string;
};

type SiteConfig = {
  siteName: string;
  domain: string;
  menu: { label: string; href: string }[];
  categories: Category[];
};
```

---

## 5. Regra de ouro para esta fase

Nenhum componente deve ter texto ou dado fixo (hardcoded) diretamente no JSX além de labels genéricos de UI (ex: "Leia mais", "Ver todos"). Todo conteúdo real (títulos, textos, categorias) vem de `mock-data.ts` ou `site.config.ts`.

Isso garante que, quando o Supabase entrar na Fase 2, só precisaremos trocar a fonte dos dados — não reescrever componentes.

---

## 6. Critério de sucesso desta fase

O projeto está pronto quando:
1. `npm run dev` builda sem erros
2. Homepage lista posts vindos de `mock-data.ts`
3. Clicar num post leva para `/post/[slug]` com conteúdo correto
4. Categorias filtram posts corretamente em `/category/[slug]`
5. Reviews funcionam de forma equivalente aos posts
6. Header e Footer usam dados de `site.config.ts` (não hardcoded)

Quando esses 6 pontos estiverem OK, avisar e parar — não avançar para Supabase/deploy sem o próximo documento.
