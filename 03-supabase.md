# PROJECT ATLAS — Blog Structure Engine
## Documento 3 de 4: Integração com Supabase

> **Instrução para o Claude Code:** a Etapa 0 abaixo é manual, feita pela pessoa (não por você). As etapas 1 em diante são para você executar, na ordem, parando ao final de cada uma para revisão.

---

## Etapa 0 — Ação manual (feita pela pessoa, não pelo Claude Code)

1. Acessar https://supabase.com e fazer login (criar conta se não tiver)
2. Clicar em "New Project"
3. Escolher um nome (ex: `atlas-blog`), uma senha forte para o banco, e a região mais próxima
4. Aguardar o projeto ser provisionado (leva 1-2 minutos)
5. No painel do projeto, ir em **Project Settings → API** e copiar:
   - `Project URL`
   - `anon public key`

Guardar essas duas informações — serão usadas na Etapa 1.

**Se a pessoa já tiver um projeto Supabase criado, pular direto para a Etapa 1.**

---

## Etapa 1 — Configurar variáveis de ambiente

Criar `.env.local` na raiz do projeto (não commitar este arquivo — confirmar que `.env.local` está no `.gitignore`):

```
NEXT_PUBLIC_SUPABASE_URL=<Project URL colada pela pessoa>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key colada pela pessoa>
```

Instalar dependências:

```bash
npm install @supabase/supabase-js prisma @prisma/client
npx prisma init
```

Criar `/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Verificação:** `npx tsc --noEmit` sem erros.

---

## Etapa 2 — Schema do banco (Prisma)

Editar `prisma/schema.prisma` com as seguintes tabelas, respeitando os tipos definidos no Documento 1 (`Post`, `Review`, `Category`, `Author`):

```prisma
model Author {
  id        String   @id @default(uuid())
  slug      String   @unique
  name      String
  bio       String
  avatar    String?
  posts     Post[]
  reviews   Review[]
  createdAt DateTime @default(now())
}

model Category {
  id          String   @id @default(uuid())
  slug        String   @unique
  name        String
  description String?
  posts       Post[]
}

model Post {
  id             String   @id @default(uuid())
  slug           String   @unique
  title          String
  excerpt        String
  content        String
  publishedDate  DateTime
  coverImage     String?
  category       Category @relation(fields: [categoryId], references: [id])
  categoryId     String
  author         Author   @relation(fields: [authorId], references: [id])
  authorId       String
}

model Review {
  id           String   @id @default(uuid())
  slug         String   @unique
  productName  String
  rating       Float
  summary      String
  content      String
  pros         String[]
  cons         String[]
  coverImage   String?
  author       Author   @relation(fields: [authorId], references: [id])
  authorId     String
}
```

Rodar:

```bash
npx prisma migrate dev --name init
```

**Verificação:** migration roda sem erro, tabelas aparecem no painel do Supabase (Table Editor).

---

## Etapa 3 — Migrar dados mock para o banco

Criar um script `/scripts/seed.ts` que lê os dados de `/lib/mock-data.ts` e insere no banco via Prisma Client (autores primeiro, depois categorias, depois posts e reviews, respeitando as relações).

Rodar:

```bash
npx tsx scripts/seed.ts
```

**Verificação:** dados aparecem no Table Editor do Supabase, com as mesmas quantidades do mock (6 posts, 3 reviews, 3 categorias, 2 autores).

---

## Etapa 4 — Trocar a fonte de dados nas páginas

Em cada `/app/**/page.tsx` que hoje importa de `mock-data.ts`, substituir por chamadas ao Prisma Client (via Server Components do Next.js — não precisa de API route separada nesta fase).

Regra: os componentes (`PostCard`, `ReviewCard`, etc.) **não mudam** — eles continuam recebendo os mesmos tipos via props. Só muda de onde a página busca os dados.

**Verificação:**
- `npm run build` sem erros
- Navegar pelo site local e confirmar que os dados vêm do banco (teste: editar um título direto no Table Editor do Supabase, recarregar a página, confirmar que mudou)

---

## Etapa 5 — Checklist final

1. `.env.local` configurado e no `.gitignore`
2. Schema Prisma criado e migrado
3. Dados migrados do mock para o Supabase
4. Todas as páginas buscam dados do banco, não mais de `mock-data.ts`
5. Editar dado no Supabase reflete no site após reload

Ao concluir, parar e aguardar confirmação antes do Documento 4 (GitHub + Vercel).
