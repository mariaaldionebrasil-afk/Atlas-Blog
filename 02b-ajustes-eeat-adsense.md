# PROJECT ATLAS — Blog Structure Engine
## Adendo ao Documento 2: Sinais de Confiança (E-E-A-T / AdSense)

> **Instrução para o Claude Code:** a Fase 1 (Documento 2) já foi concluída e aprovada. Este adendo adiciona elementos exigidos por boas práticas do Google e políticas do AdSense, antes de avançarmos para o Documento 3 (Supabase). Trate como uma "Etapa 6", seguindo o mesmo padrão: execute, rode verificação, pare para revisão.

Motivo: sites sem sinais claros de autoria real e páginas de confiança completas são frequentemente rejeitados no AdSense por falta de E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).

---

## Etapa 6 — Sinais de autoria e confiança

### 6.1 Atualizar tipos

Em `/lib/types.ts`, adicionar:

```typescript
type Author = {
  slug: string;
  name: string;
  bio: string;
  avatar?: string;
};
```

E adicionar o campo `author: Author` em `Post` e `Review`.

### 6.2 Atualizar dados mock

Em `/lib/mock-data.ts`, criar 1-2 autores fake completos (nome, bio curta, avatar placeholder) e associar cada post/review existente a um desses autores.

### 6.3 Novo componente: AuthorBio

Criar `/components/AuthorBio.tsx` — recebe um `Author` via props, mostra avatar, nome e bio curta. Usar esse componente:
- No rodapé de cada `/post/[slug]`
- No rodapé de cada `/review/[slug]`

### 6.4 Página "Quem somos" real

Reescrever `/app/about/page.tsx` — não deixar texto genérico tipo "bem-vindo ao meu blog". Estrutura mínima:
- Missão do site (2-3 frases sobre o que o blog cobre e para quem)
- Bloco "Nossa equipe" ou "Quem escreve aqui" usando os autores de `mock-data.ts`
- Como o conteúdo é produzido/revisado (1 parágrafo)

### 6.5 Página de Privacidade e Termos

Criar:
- `/app/privacy-policy/page.tsx` — deve mencionar explicitamente uso de cookies e publicidade de terceiros (Google AdSense). Usar texto placeholder claramente meçável, mas estruturalmente completo — o texto final será revisado por você antes de publicar.
- `/app/terms/page.tsx` — termos de uso básicos.

Adicionar links para essas páginas no Footer (Etapa 2 do Documento 2 já criou o Footer — apenas adicionar os links).

### 6.6 Contato funcional

Em `/app/contact/page.tsx`, garantir que exista um formulário (mesmo que sem backend ainda — o envio real fica pra Fase 2) ou um e-mail de contato visível e claro.

---

## Verificação desta etapa

1. Todo post e review mostra um bloco de autor (nome + bio) visível
2. `/about` tem conteúdo real, não genérico
3. `/privacy-policy` menciona cookies e Google AdSense
4. Footer linka para Privacy Policy e Terms
5. `npm run build` sem erros

Ao concluir, parar e aguardar confirmação antes do Documento 3.

---

## Nota importante (não é tarefa do Claude Code, é para você)

Antes de aplicar para o AdSense de verdade, os textos de "Quem somos", Privacy Policy e Termos precisam ser **reescritos com informação real** (seu nome ou o nome do responsável pelo site, e-mail real, endereço se exigido). Texto placeholder gerado automaticamente não passa na revisão humana do Google — isso é conteúdo que precisa ser genuinamente seu.
