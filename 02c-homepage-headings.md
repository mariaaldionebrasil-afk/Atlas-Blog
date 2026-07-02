# PROJECT ATLAS — Blog Structure Engine
## Adendo: Homepage Completa + Hierarquia de Headings (Etapa 7)

> **Instrução para o Claude Code:** as Etapas 1-6 já foram concluídas. Esta etapa faz duas coisas: (A) expande a homepage com blocos adicionais recomendados por boas práticas de SEO, e (B) audita e corrige a hierarquia de headings (H1-H6) em todo o projeto. Execute A e depois B, na ordem, parando ao final de cada uma para revisão.

---

## PARTE A — Expandir a Homepage

A homepage atual só tem "Artigos recentes" e "Reviews em destaque". Adicionar, nesta ordem visual:

1. **Hero / proposta de valor** (se ainda não existir de forma clara) — usar o componente `HeroSection.tsx` já existente, com título e subtítulo vindos de `site.config.ts`
2. **Artigos recentes** (já existe — manter)
3. **Reviews em destaque** (já existe — manter)
4. **Navegação por categorias** — novo bloco. Criar componente `CategoryGrid.tsx` que recebe a lista de `Category` (de `site.config.ts`) e renderiza um card/link para cada `/category/[slug]`
5. **Teaser "Quem somos"** — novo bloco pequeno na homepage. Criar componente `AboutTeaser.tsx`: 2-3 frases (pode reaproveitar um resumo curto do conteúdo já escrito em `/about`) + botão/link "Conheça nossa equipe" → `/about`

Adicionar esses dois novos componentes em `/app/page.tsx`, na ordem acima.

**Verificação Parte A:**
- Homepage mostra 5 blocos distintos
- `CategoryGrid` linka corretamente para cada `/category/[slug]`
- `AboutTeaser` linka para `/about`
- `npm run build` sem erros

---

## PARTE B — Auditoria de Hierarquia de Headings

Regra a aplicar em **todas** as páginas do projeto:

- Exatamente **1 H1 por página** — nunca no Header/logo, sempre no conteúdo principal da página
- **H2** para as seções principais da página
- **H3** apenas dentro de um H2, quando precisar subdividir
- **Proibido pular nível** (H1 direto para H3, H2 direto para H4, etc.)
- Headings nunca usados só por causa do tamanho da fonte — se for estilo visual, usar classe CSS, não tag de heading

### O que verificar página por página:

| Página | H1 deve ser |
|---|---|
| `/` (Homepage) | Nome do site ou proposta de valor principal (do Hero) |
| `/blog` | "Blog" ou "Artigos" |
| `/post/[slug]` | Título do post |
| `/category/[slug]` | Nome da categoria |
| `/reviews` | "Reviews" |
| `/review/[slug]` | Nome do produto revisado |
| `/about` | "Quem somos" ou equivalente |
| `/contact` | "Contato" |
| `/privacy-policy` | "Política de Privacidade" |
| `/terms` | "Termos de Uso" |

Dentro de `/post/[slug]` e `/review/[slug]` especificamente, garantir que os títulos de seção do conteúdo (se houver, ex: "Prós e Contras" numa review) usem H2, e que qualquer subdivisão use H3 — nunca pular para H4 sem H3 antes.

**Tarefa prática:** percorrer cada arquivo em `/app/**/page.tsx` e cada componente relevante, confirmar/corrigir as tags de heading conforme a tabela acima. Reportar em formato de tabela: página, heading encontrado antes, heading corrigido (se houve mudança).

**Verificação Parte B:**
- Todas as páginas da tabela têm exatamente 1 H1
- Nenhuma página pula nível de heading
- `npm run build` sem erros

---

Ao concluir A e B, parar e apresentar o resumo. Continuamos aguardando o Documento 3 (Supabase) depois disso.
