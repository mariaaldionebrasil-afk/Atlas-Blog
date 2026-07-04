# PROJECT ATLAS — Blog Structure Engine
## Documento 7 de 8: Reviews e Roundups (Afiliados)

> **Instrução para o Claude Code:** o Documento 6 já foi concluído (esteira de conteúdo para Posts). Este documento adiciona o fluxo específico para Reviews individuais e Roundups (listas de produtos), incluindo links de afiliado. Sem etapa manual — pode começar direto pela Etapa 1.

Referência: `06-especificacao-esteira-conteudo.md`, seções "Decisões sobre reviews" e "Artigos de Review: dois formatos distintos".

---

## Etapa 1 — Atualizar schema do banco

Em `Review`, adicionar:

```prisma
sourceUrls    Json?
keyword       Keyword? @relation(fields: [keywordId], references: [id])
keywordId     String?
scheduledDate DateTime?
affiliateLinkAmazon      String?
affiliateLinkMercadoLivre String?
```

Atualizar enum de status do `Review` para usar o mesmo `ContentStatus` (DRAFT/SCHEDULED/PUBLISHED) já criado no Documento 6.

Criar novos modelos:

```prisma
model Roundup {
  id            String        @id @default(uuid())
  slug          String        @unique
  title         String
  snippet       String
  introContent  String
  status        ContentStatus @default(DRAFT)
  scheduledDate DateTime?
  author        Author        @relation(fields: [authorId], references: [id])
  authorId      String
  items         RoundupItem[]
  createdAt     DateTime      @default(now())
}

model RoundupItem {
  id        String  @id @default(uuid())
  roundup   Roundup @relation(fields: [roundupId], references: [id])
  roundupId String
  review    Review  @relation(fields: [reviewId], references: [id])
  reviewId  String
  position  Int
}
```

Rodar `npx prisma migrate dev --name reviews_roundups`.

**Verificação:** migration aplicada sem erro.

---

## Etapa 2 — Geração de Review individual com fontes pesquisadas

No painel, ao criar um novo Review a partir de uma Keyword de silo Apoio/Satélite:

1. Botão "Pesquisar e gerar review" — usa a IA de texto com **Grounding via Google Search** ativado (recurso da API do Gemini)
2. IA pesquisa reviews/testes reais do produto, sintetiza (nunca copia trechos longos — paráfrase obrigatória), e retorna o conteúdo do review + a lista de fontes usadas
3. Fontes salvas em `Review.sourceUrls`
4. Resultado cai como `status: DRAFT`

**Tela de revisão específica para Review** (diferente da fila genérica do Documento 6):
- Mostra o texto gerado E a lista de fontes usadas, lado a lado
- Pessoa confirma que as fontes são adequadas antes de poder aprovar (checagem obrigatória, decisão já registrada — diferente dos Posts normais, que não exigem isso)
- Após confirmar fontes: mesma opção de editar ou aprovar sem edição
- Ao aprovar: agendar `scheduledDate`, status vira `SCHEDULED`

**Verificação:** gerar 1 review de teste, confirmar que fontes aparecem listadas e que não é possível aprovar sem a etapa de confirmação de fontes.

---

## Etapa 3 — Campos de afiliado no Review

No formulário de Review, adicionar dois campos: `affiliateLinkAmazon` e `affiliateLinkMercadoLivre` (ambos opcionais, mas pelo menos 1 deve ser preenchido antes de aprovar).

Criar componente `/components/AffiliateButton.tsx`:
- Recebe `label` e `url`
- Renderiza `<a>` com `rel="sponsored nofollow" target="_blank"` **sempre** — não deve haver como esquecer isso, o componente aplica por padrão

Usar esse componente na página `/review/[slug]` para os botões de compra.

**Verificação:** inspecionar o HTML renderizado de um review de teste e confirmar que os links de afiliado têm `rel="sponsored nofollow"`.

---

## Etapa 4 — Roundups

Criar `/app/admin/roundups/page.tsx`:

1. Pessoa seleciona um silo Pilar (ex: "15 Melhores Bicicletas Ergométricas")
2. Sistema lista os Reviews já aprovados/publicados associados a esse silo
3. Botão "Gerar roundup" — IA gera: título, snippet, texto de introdução, e monta a ordem/ranking sugerido dos produtos (a pessoa pode reordenar)
4. Resultado cai como `Roundup` com `status: DRAFT`, com os `RoundupItem` já criados referenciando os Reviews selecionados

**Verificação:** gerar 1 roundup de teste a partir de 3 reviews aprovados, confirmar que a ordem é editável e que cada item referencia corretamente um Review existente (não duplica dados).

---

## Etapa 5 — Página pública do Roundup

Criar `/app/roundup/[slug]/page.tsx` com o layout definido na especificação:

```
H1 + snippet (meta description)
Disclosure de afiliado (topo, primeira tela)
Resumo rápido da escolha #1
Tabela comparativa (imagem, nome, preço, nota, botão CTA) — dados puxados de cada Review referenciado
Texto de introdução sobre a categoria
Para cada produto: resumo curto + pros/cons resumidos + AffiliateButton (Amazon/Mercado Livre) + link "Ver review completo" → /review/[slug]
FAQ (se a IA tiver gerado)
```

Em `/review/[slug]`, adicionar bloco "Faz parte de: [Nome do Roundup]" linkando de volta, quando aplicável.

**Verificação:**
- `/roundup/[slug]` de teste carrega corretamente, tabela mostra os produtos certos
- Clicar em "Ver review completo" leva ao `/review/[slug]` certo
- O Review individual mostra o link de volta pro Roundup
- Rascunhos/agendados não aparecem publicamente (mesma regra do Documento 6)

---

## Etapa 6 — Integrar Roundup e Review na fila de agendamento

Estender a lógica do cron (Documento 6, Etapa 7) para também processar `Review` e `Roundup` com `status: SCHEDULED` e `scheduledDate <= agora`, publicando ambos.

**Verificação:** agendar 1 review e 1 roundup de teste para "daqui a 2 minutos", confirmar publicação automática, depois reverter.

---

## Checklist final do Documento 7

1. Reviews gerados com pesquisa de fontes reais, checagem obrigatória antes de aprovar
2. Links de afiliado sempre com `rel="sponsored nofollow"`
3. Roundups referenciam Reviews existentes sem duplicar dados
4. Linkagem cruzada Roundup ↔ Review funcionando nos dois sentidos
5. Cron publica Reviews e Roundups agendados
6. `npm run build` sem erros, commit e push feitos

Ao concluir, parar e aguardar o Documento 8 (Publicação Social).
