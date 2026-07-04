# PROJECT ATLAS — Blog Structure Engine
## Documento 6 de 8: Esteira de Conteúdo (Keywords → Silos → Tópicos → Artigos)

> **Instrução para o Claude Code:** os Documentos 1-5 já foram concluídos. A Etapa 0 é manual. As demais são para você executar, parando ao final de cada uma. Este documento cobre só POSTS normais — Reviews e Roundups têm regras próprias no Documento 7.

Referência completa de decisões: ver arquivo `06-especificacao-esteira-conteudo.md` nesta mesma pasta — leia-o por completo antes de começar.

---

## Etapa 0 — Ação manual (feita pela pessoa)

1. No `.env.local`, adicionar (se ainda não existir):
```
GEMINI_TEXT_API_KEY=<chave de texto do Google AI Studio>
GEMINI_IMAGE_API_KEY=<chave de imagem, já usada no Documento 5>
```
2. Adicionar essas mesmas variáveis nas Environment Variables da Vercel

---

## Etapa 1 — Atualizar schema do banco

Adicionar ao `schema.prisma`:

```prisma
enum SiloType {
  PILAR
  APOIO
  SATELITE
}

enum KeywordStatus {
  PENDENTE
  APROVADA
  CANIBALIZADA
  REMOVIDA
}

model Keyword {
  id                String        @id @default(uuid())
  term              String
  searchIntent      String?
  volume            Int?
  cpc               Float?
  status            KeywordStatus @default(PENDENTE)
  cannibalizationNote String?
  silo              Silo?         @relation(fields: [siloId], references: [id])
  siloId            String?
  posts             Post[]
  createdAt         DateTime      @default(now())
}

model Silo {
  id        String    @id @default(uuid())
  name      String
  type      SiloType
  parent    Silo?     @relation("SiloHierarchy", fields: [parentId], references: [id])
  parentId  String?
  children  Silo[]    @relation("SiloHierarchy")
  keywords  Keyword[]
}
```

Em `Post`, adicionar:

```prisma
keyword       Keyword? @relation(fields: [keywordId], references: [id])
keywordId     String?
outline       Json?
scheduledDate DateTime?
```

E atualizar o enum de status:

```prisma
enum ContentStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
}
```

Rodar `npx prisma migrate dev --name esteira_conteudo`.

**Verificação:** migration aplicada sem erro, tabelas novas visíveis no Supabase.

---

## Etapa 2 — Importação e checagem de canibalização de Keywords

Criar `/app/admin/keywords/page.tsx`:

- Campo de importação: textarea onde a pessoa cola keywords no formato `termo, intenção, volume, cpc` (uma por linha)
- Botão "Verificar canibalização": envia a lista para a IA de texto (Gemini), que identifica keywords com intenção de busca sobreposta e sugere quais remover/mesclar
- Lista editável: pessoa pode aprovar, remover, ou marcar como resolvida cada keyword sinalizada
- Status de cada keyword visível (Pendente / Aprovada / Canibalizada / Removida)

**Verificação:** importar uma lista de teste com 2 keywords propositalmente conflitantes, confirmar que a IA sinaliza o conflito corretamente.

---

## Etapa 3 — Estrutura de Silo

Criar `/app/admin/silos/page.tsx`:

- Botão "Gerar estrutura de silo" — usa as keywords aprovadas, IA propõe hierarquia (1 Pilar + N Apoio + N Satélite)
- Interface de edição: pessoa pode reatribuir uma keyword para outro silo, renomear, ou remover antes de aprovar
- Ao aprovar, salva a estrutura no banco (`Silo` + relação com `Keyword`)

**Verificação:** gerar estrutura a partir de 5-6 keywords de teste, confirmar hierarquia coerente (1 pilar, resto distribuído entre apoio/satélite).

---

## Etapa 4 — Tópicos (outline) por artigo

Na tela de cada Keyword aprovada e associada a um silo, adicionar botão "Gerar tópicos":

- IA propõe outline (lista de H2/H3) para aquele artigo
- Campo editável: pessoa acrescenta, remove ou reordena tópicos
- Botão "Aprovar tópicos" salva o outline em `Post.outline` (JSON) e cria o registro `Post` em status inicial (ainda sem conteúdo completo)

**Verificação:** gerar outline para 1 keyword de teste, editar manualmente um tópico, confirmar que a edição persiste.

---

## Etapa 5 — Geração do artigo completo

No `Post` com outline aprovado, botão "Gerar artigo completo":

1. IA de texto gera o conteúdo completo, seguindo o outline aprovado
2. Nos pontos indicados pela IA como relevantes para imagem, gera automaticamente via `generateImage.ts` (já existe, do Documento 5) e insere no conteúdo
3. Salva como `Post` com `status: DRAFT`

**Verificação:** gerar 1 artigo de teste completo, confirmar que title, conteúdo, e ao menos 1 imagem foram gerados e salvos corretamente.

---

## Etapa 6 — Fila de revisão e agendamento

Criar `/app/admin/queue/page.tsx`:

- Lista todos os `Post` com `status: DRAFT` que já têm conteúdo completo (outline + artigo gerados)
- Para cada um: opção de **editar o texto livremente** OU **aprovar sem edição** (ambas disponíveis, sem obrigatoriedade — decisão já registrada na especificação)
- Ao aprovar: campo de data para agendar (`scheduledDate`), muda `status` para `SCHEDULED`

**Verificação:** aprovar 1 post de teste com data futura, confirmar que ele aparece como `SCHEDULED`, não `PUBLISHED`, e não aparece no site público ainda.

---

## Etapa 7 — Job de publicação agendada

Configurar **Vercel Cron** (arquivo `vercel.json` com `crons`) para rodar a cada hora, chamando uma API route `/app/api/cron/publish/route.ts`:

- Busca todos os `Post` com `status: SCHEDULED` e `scheduledDate <= agora`
- Muda `status` para `PUBLISHED`

**Verificação:** criar um post de teste agendado para "daqui a 2 minutos" (ajuste manual só para teste), confirmar que após o cron rodar ele vira `PUBLISHED` e aparece no site público. Depois reverter esse post de teste.

---

## Checklist final do Documento 6

1. Keywords importadas e canibalização detectada
2. Estrutura de Silo gerada e editável
3. Tópicos gerados e editáveis por artigo
4. Artigo completo gerado com imagens
5. Fila de revisão com opção de editar ou aprovar direto
6. Agendamento funcional
7. Cron publica automaticamente na data certa
8. `npm run build` sem erros, commit e push feitos

Ao concluir, parar e aguardar o Documento 7 (Reviews e Roundups).
