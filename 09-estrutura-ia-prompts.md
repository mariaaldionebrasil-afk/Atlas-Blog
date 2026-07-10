# PROJECT ATLAS — Blog Structure Engine
## Documento 9 de 10: Schema, IA de Estrutura e Regras de Conteúdo por Tipo

> **Instrução para o Claude Code:** leia primeiro o arquivo `06-especificacao-esteira-conteudo.md` por completo, especialmente a seção final "ARQUITETURA REVISADA". Esse documento reformula partes dos Documentos 6 e 7 — não é aditivo simples, é uma correção de rumo. A Etapa 0 é manual. As demais você executa, parando para revisão.

---

## Etapa 0 — Ação manual (feita pela pessoa)

1. Acessar https://aistudio.google.com
2. Gerar uma nova API key (pode ser da mesma conta das outras)
3. Adicionar no `.env.local`:
```
GEMINI_STRUCTURE_API_KEY=<chave nova>
```
4. Adicionar essa mesma variável nas Environment Variables da Vercel

---

## Etapa 1 — Atualizar schema do banco

Em `Post`, adicionar:

```prisma
enum PostType {
  APOIO
  INFORMACIONAL
  COMPARACAO
}

// no model Post, adicionar:
postType              PostType?
affiliateLinkAmazon    String?   // usado só quando postType = APOIO
affiliateLinkMercadoLivre String? // usado só quando postType = APOIO
comparedReviewIdA      String?   // usado só quando postType = COMPARACAO
comparedReviewIdB      String?   // usado só quando postType = COMPARACAO
comparedReviewA        Review?   @relation("ComparisonA", fields: [comparedReviewIdA], references: [id])
comparedReviewB        Review?   @relation("ComparisonB", fields: [comparedReviewIdB], references: [id])
```

Confirmar que `Roundup`/`RoundupItem` já suportam de 1 a 15 itens sem limite artificial no schema (não deve haver constraint de quantidade no banco — o limite de "até 15" é regra de UI/prompt, não de schema).

Rodar `npx prisma migrate dev --name post_types_comparacao`.

**Verificação:** migration aplicada sem erro. Confirmar no Supabase que os campos novos existem na tabela `Post`.

---

## Etapa 1.5 — Correção do prompt de canibalização (pendência do Documento 6)

Localizar o prompt de checagem de canibalização usado em `/app/admin/keywords/page.tsx` (Documento 6, Etapa 2). Ajustar para ser mais criterioso:

```
Ao avaliar se duas keywords competem entre si (canibalização), considere
que keywords de cauda longa com ângulos de busca DIFERENTES não são
canibalização, mesmo compartilhando o mesmo tema geral. Exemplos que
NÃO são canibalização: "X emagrece" vs "X para iniciantes" vs "quantas
calorias X queima" — são ângulos distintos que merecem artigos
separados. Só sinalize canibalização quando as duas keywords
claramente disputariam a MESMA página para satisfazer a MESMA
intenção de busca (ex: "melhor X" e "X mais vendido" são
essencialmente a mesma busca). Na dúvida, NÃO sinalize — prefira
falso-negativo a falso-positivo, já que descartar uma keyword válida
custa mais que manter uma competição leve.
```

**Verificação:** reimportar o conjunto de teste antigo (emagrece / para iniciantes / quantas calorias queima), confirmar que agora NÃO são mais sinalizadas como canibalização entre si.

---

## Etapa 2 — Nova tela "Gerar Estrutura"

Criar `/app/admin/generate-structure/page.tsx` (substitui/expande a antiga tela de silos):

**Interface:**
- Campo único: keyword semente (ex: "bicicleta ergométrica")
- Botão "Gerar estrutura completa"
- Área de resultado: árvore hierárquica editável (ver Etapa 3 para o formato)
- Botão "Aprovar e salvar estrutura"
- Após salvar: tela reseta automaticamente, pronta para nova keyword semente

**Verificação:** a tela carrega, aceita input, e o botão de gerar está desabilitado até haver texto no campo.

---

## Etapa 3 — Prompt de geração de estrutura (o núcleo deste documento)

Criar `/lib/generateSiloStructure.ts`. Usar `GEMINI_STRUCTURE_API_KEY`. O prompt do sistema deve conter, literalmente, todas as regras abaixo — não resumir ou parafrasear, copiar as regras como instrução direta ao modelo:

```
Você é um planejador de arquitetura de conteúdo SEO. Você NÃO decide a
estratégia — você aplica rigorosamente as regras abaixo a partir de 1
keyword semente fornecida pelo usuário. Se alguma regra parecer ambígua
para o caso específico, prefira gerar MENOS itens em vez de inventar
uma interpretação livre.

## Os 5 tipos de conteúdo que você pode gerar (nunca invente um 6º tipo)

1. SINGLE_PRODUCT_REVIEW — review de 1 produto único (marca+modelo
   específico). Comercial, tem CTA de afiliado.

2. ARTIGO_SILO — lista de 1 a 15 produtos, cada um referenciando um
   Single Product Review. Comercial. Só existe 1 por estrutura gerada
   (é o artigo "cabeça" desta árvore).

3. APOIO — recorte comercial mais estreito do mesmo nicho (ex: uma
   variação de estilo, categoria de preço, ou característica
   específica). Tem CTA de afiliado para 1 produto específico, que
   também deve estar entre os produtos do ARTIGO_SILO.

4. INFORMACIONAL — conteúdo sem intenção comercial, sem CTA de
   afiliado. Duas variações:
   4a. Processo/como fazer (ex: "como montar X", "como limpar X")
   4b. Definição/dúvida (ex: "X faz Y?", "o que é X")

5. COMPARACAO — "Produto A vs Produto B", cabeça a cabeça entre 2
   produtos específicos do ARTIGO_SILO. REGRA CRÍTICA: esta é a
   categoria mais arriscada de gerar incorretamente. Por padrão, gere
   ZERO itens deste tipo. Só gere uma Comparação se os dois produtos
   forem claramente os 2 mais relevantes/populares de toda a lista
   (ex: os 2 com nota mais alta, ou os 2 mais frequentemente citados
   como concorrentes diretos) — nunca combine produtos aleatórios só
   para preencher a proporção. É preferível gerar 0 Comparações a
   gerar uma sem justificativa forte. (Nota para versão futura: esta
   regra deve evoluir para usar dado real de volume de busca via
   Grounding, assim como já fazemos na geração de Reviews — por ora,
   a IA decide de forma conservadora, sem verificação externa.)

## Meta de proporção obrigatória

Do total de itens satélite gerados (excluindo o ARTIGO_SILO em si),
aproximadamente 70% devem ser INFORMACIONAL e 30% devem ser comerciais
(SINGLE_PRODUCT_REVIEW + APOIO + COMPARACAO somados). Isso reflete a
distribuição real de intenção de busca do mercado. Não gere uma
estrutura onde a maioria do conteúdo é comercial.

Gere entre 10 e 20 itens satélite no total (fora o ARTIGO_SILO), nunca
menos que 8 nem mais que 25, salvo instrução explícita do usuário
pedindo um número diferente.

## Exemplo completo resolvido (siga este padrão de raciocínio)

Keyword semente: "frigobar silencioso"

{
  "silo": { "name": "Melhor Frigobar Silencioso", "seedKeyword": "frigobar silencioso" },
  "items": [
    { "type": "SINGLE_PRODUCT_REVIEW", "keyword": "frigobar consul crp08 review", "title": "Consul CRP08: Vale a Pena?", "searchIntentFormat": "criterios_evidencia" },
    { "type": "SINGLE_PRODUCT_REVIEW", "keyword": "frigobar electrolux re120 review", "title": "Electrolux RE120: Análise Completa", "searchIntentFormat": "criterios_evidencia" },
    { "type": "ARTIGO_SILO", "keyword": "melhor frigobar silencioso", "title": "Os Melhores Frigobares Silenciosos de 2026", "searchIntentFormat": "lista_marcadores_tabela" },
    { "type": "APOIO", "keyword": "qual melhor frigobar retrô", "title": "Qual o Melhor Frigobar Retrô?", "searchIntentFormat": "lista_marcadores_tabela" },
    { "type": "INFORMACIONAL", "keyword": "como limpar frigobar retrô", "title": "Como Limpar um Frigobar Retrô (Passo a Passo)", "searchIntentFormat": "lista_numerada" },
    { "type": "INFORMACIONAL", "keyword": "frigobar consome muita energia", "title": "Frigobar Consome Muita Energia? O Que Diz a Conta de Luz", "searchIntentFormat": "paragrafo_direto" },
    { "type": "INFORMACIONAL", "keyword": "frigobar silencioso decibéis quanto", "title": "Quantos Decibéis Tem um Frigobar Silencioso?", "searchIntentFormat": "paragrafo_direto" }
  ]
}

Note neste exemplo: o APOIO tem um ângulo comercial mais estreito
(retrô) que o ARTIGO_SILO (silencioso, mais amplo). Os INFORMACIONAIS
cobrem ângulos variados (manutenção, custo, especificação técnica) —
nunca repita o mesmo ângulo informacional duas vezes. Cada
INFORMACIONAL deve ter um `searchIntentFormat` condizente com o tipo
de pergunta (processo = lista_numerada, definição/dúvida = paragrafo_direto).

## Regras de linkagem que cada tipo deve respeitar (você deve gerar os
## metadados de link, não só o texto)

- ARTIGO_SILO ↔ SINGLE_PRODUCT_REVIEW: bidirecional
- APOIO → ARTIGO_SILO: unidirecional (Apoio linka para o Silo, não o contrário)
- INFORMACIONAL → ARTIGO_SILO: unidirecional
- COMPARACAO → ARTIGO_SILO + os 2 SINGLE_PRODUCT_REVIEW comparados: unidirecional para o Silo
- SINGLE_PRODUCT_REVIEW não linka lateralmente com outros reviews
- Nunca gere links para fora desta estrutura (outro silo)

## Formato de saída

Retorne APENAS JSON, sem texto antes ou depois, no formato:

{
  "silo": { "name": "string", "seedKeyword": "string" },
  "items": [
    {
      "type": "SINGLE_PRODUCT_REVIEW" | "ARTIGO_SILO" | "APOIO" | "INFORMACIONAL" | "COMPARACAO",
      "keyword": "string",
      "title": "string (título proposto)",
      "searchIntentFormat": "lista_numerada" | "paragrafo_direto" | "lista_marcadores_tabela" | "tabela" | "criterios_evidencia",
      "comparedProducts": ["keyword A", "keyword B"] // só se type = COMPARACAO
    }
  ]
}
```

**Após a chamada da IA:** o resultado deve popular a árvore editável na tela (Etapa 2) — a pessoa pode remover itens, editar títulos, ou reclassificar o tipo antes de aprovar. Nada é salvo no banco até o clique em "Aprovar e salvar estrutura".

**Ao aprovar:** criar os registros correspondentes (`Keyword`, `Silo`, e os itens ainda sem conteúdo — só metadados de título/tipo/keyword, o texto completo vem depois na Fila de Criação, Documento 10).

**Verificação:**
1. Gerar estrutura de teste a partir de "bicicleta ergométrica"
2. Confirmar que a proporção fica próxima de 70/30
3. Confirmar que nenhuma Comparação foi gerada sem justificativa clara (ler o resultado e avaliar)
4. Editar manualmente um item antes de aprovar, confirmar que a edição persiste
5. Aprovar e confirmar que os registros foram criados no banco

---

## Etapa 4 — Prompt de geração de conteúdo por tipo (formato por SERP)

Atualizar `/lib/generateArticleContent.ts` (ou equivalente já existente) para incluir, no prompt de geração de texto completo, a tabela de formato obrigatório:

```
Ao escrever cada seção H2/H3, identifique que tipo de busca aquela
seção está respondendo e use o formato correspondente:

- "Como fazer/montar/limpar X" → lista numerada, 5 a 8 passos, cada
  item começando com verbo de ação, uma frase por passo
- "O que é X" / "X faz Y?" → parágrafo direto de 40-60 palavras
  IMEDIATAMENTE após o heading, sem introdução tipo "vamos explicar..."
- "Melhor X" → lista com marcadores + tabela comparativa
- "X vs Y" → tabela HTML limpa, headers descritivos, sem células
  mescladas
- Avaliação de produto → critérios explícitos, evidência concreta,
  limitações honestas, CTA progressivo (não força venda logo de cara)

REGRA OBRIGATÓRIA: cada seção H2 responde exatamente 1 pergunta ou
subtema. Nunca combine 2 perguntas diferentes sob o mesmo heading —
separe em headings distintos. A resposta direta deve aparecer nos
primeiros 100-150 palavras da seção, sem preâmbulo.
```

O campo `searchIntentFormat` gerado na Etapa 3 deve ser passado para esse prompt, indicando qual formato usar em cada seção do outline.

**Verificação:** gerar 1 artigo Informacional (tipo processo) e 1 Informacional (tipo definição), confirmar visualmente que os formatos saem diferentes (lista numerada vs. parágrafo direto).

---

## Etapa 5 — Layout do Artigo Silo com hierarquia de CTA

Atualizar o template `/app/roundup/[slug]/page.tsx` para:

1. Cada bloco de produto tem espaçamento generoso entre si (não comprimido)
2. Os 2 botões de CTA (Amazon/Mercado Livre) têm hierarquia visual: 1 estilizado como primário (mais destaque/contraste), 1 como secundário (mais discreto) — não os dois com peso visual igual
3. Se houver dado de nota/rating, exibir uma linha curta de confiança acima dos botões (ex: "4.5/5 · Frete grátis" — usar só os dados que existirem, não inventar)

**Verificação:** visualizar um Artigo Silo de teste, confirmar que os 2 CTAs por produto são visualmente distintos entre si.

---

## Etapa 6 — Páginas públicas de Apoio, Informacional e Comparação

Todos os três reaproveitam o template `/post/[slug]` já existente (não criar templates novos separados) — a diferença entre eles é **o conteúdo interno** (lista/parágrafo/tabela, conforme Etapa 4), não a estrutura da página.

**Ajustes necessários no template `/post/[slug]`:**

1. **Bloco de saída para o Artigo Silo** (aplica-se a Apoio, Informacional e Comparação): adicionar uma caixa de destaque logo **após a introdução do artigo, antes do conteúdo principal** — não no rodapé — do tipo "Este artigo faz parte do nosso guia: [Nome do Artigo Silo]", linkando para `/roundup/[slug]`. Colocar no início (não no fim) aumenta a chance de clique antes do leitor terminar de ler.

2. **Comparação especificamente**: garantir que a tabela HTML gerada (Etapa 4) renderiza com estilo de destaque (bordas visíveis, header diferenciado) — não como uma tabela markdown genérica sem estilo. Adicionar também, próximo à tabela, os 2 links diretos para os Single Product Reviews comparados (ex: "Ver review completo da [Produto A]" / "Ver review completo da [Produto B]").

3. **Apoio**: mostrar o único CTA de afiliado (Amazon/Mercado Livre) com o mesmo padrão de `AffiliateButton` (`rel="sponsored nofollow"`) já usado no Artigo Silo, mas sem a hierarquia primário/secundário (só 1 produto, não há comparação de destaque entre 2 CTAs).

4. **Informacional**: confirmar que nenhum componente de CTA/afiliado é renderizado — nem condicionalmente vazio, o componente não deve nem ser importado nessa rota quando o tipo for Informacional.

**Verificação:**
1. Publicar 1 artigo de cada tipo (teste), confirmar visualmente a caixa de saída para o Artigo Silo aparecendo logo no início do conteúdo
2. Confirmar que a tabela da Comparação renderiza estilizada, não como texto cru
3. Confirmar que o Informacional não tem nenhum elemento de CTA, nem no HTML gerado

---

## Checklist final do Documento 9

1. Schema atualizado (PostType, campos de comparação, links de Apoio)
2. Prompt de canibalização corrigido (menos falso-positivo)
3. Tela "Gerar Estrutura" funcional
4. Prompt de estrutura gerando proporção próxima de 70/30
5. Comparações só geradas com justificativa de demanda
6. Formato de conteúdo variando corretamente por tipo de busca
7. Hierarquia visual de CTA implementada no Artigo Silo
8. Páginas públicas de Apoio/Informacional/Comparação com bloco de saída para o Silo, tabela estilizada na Comparação, e ausência total de CTA no Informacional
9. `npm run build` sem erros, commit e push feitos

Ao concluir, parar e aguardar o Documento 10 (Fila de Criação, Fila de Publicação, reset de fluxo).
