# PROJECT ATLAS — Especificação: Esteira de Conteúdo (Documento 6)
## Registro de decisões aprovadas — não é o documento de execução ainda

> Este arquivo existe para preservar as decisões entre sessões, já que a conversa não tem memória automática. Antes de gerar o Documento 6 (prompt de execução para o Claude Code), novas ideias podem ser adicionadas aqui.

---

## Contexto

Documentos 1-5 já concluídos: boilerplate Next.js, E-E-A-T, hierarquia de headings, Supabase, deploy (GitHub + Vercel), painel `/admin` com autenticação, CRUD, status Rascunho/Publicado, geração de imagem de capa via IA (Nano Banana).

Esta especificação define a **Esteira de Conteúdo**: um fluxo dentro do painel para transformar palavras-chave em artigos publicados, com supervisão humana em múltiplos pontos.

---

## Fluxo aprovado (pipeline completo)

```
1. Importação de Keywords
   Pessoa importa palavras-chave já analisadas (intenção de busca, volume, CPC)

2. Checagem de Canibalização
   IA analisa e sinaliza keywords conflitantes (mesma intenção de busca)
   Pessoa aprova, remove ou ajusta

3. Estrutura de Silo
   IA propõe estrutura: Cabeça (pilar) / Apoio (cluster) / Satélite (cauda longa)
   Pessoa edita e aprova a estrutura

4. Tópicos por artigo
   Para cada keyword aprovada, IA propõe outline (H2/H3)
   Pessoa edita, acrescenta ou remove tópicos, aprova

5. Geração do artigo completo
   IA gera o texto completo do artigo + imagens nos pontos relevantes
   Cai como Rascunho na fila

6. Revisão antes do calendário
   Pessoa pode: (a) editar o texto livremente, ou (b) aprovar sem edição —
   ambas as opções disponíveis, critério fica com a pessoa
   (Justificativa: a supervisão humana já ocorre nas etapas 1, 2, 3 e 4,
   então uma edição obrigatória extra nesta etapa seria redundante)

7. Fila de publicação
   Artigos aprovados entram na fila com data de publicação definida pela pessoa

8. Publicação agendada
   Job automático (cron) muda status para Publicado na data programada
```

---

## Decisões sobre autoria

- Início: apenas 1 autor (a própria pessoa)
- Painel deve permitir **criar novos autores conforme parcerias forem fechadas**
- Todos os autores cadastrados devem corresponder a **pessoas reais** (não personas fictícias) — importante para não comprometer os sinais de E-E-A-T já construídos nos Documentos 2b e 1
- Sistema de múltiplos logins/permissões será necessário quando o primeiro autor adicional for cadastrado (não precisa ser complexo — RBAC simples: admin vs autor)

---

## Decisões técnicas já confirmadas

- **Duas API keys separadas do Gemini** (uma para texto, uma para imagem) — controle de custo intencional da pessoa, manter essa separação no `.env`
- Reaproveita o status `DRAFT`/`PUBLISHED` já existente (Documento 5) — não cria um terceiro estado; o "aprovado, aguardando data" pode ser modelado como `DRAFT` + campo `scheduledDate` preenchido
- Novas entidades de dados necessárias (a definir formalmente no Documento 6):
  - `Keyword` (termo, intenção de busca, volume, CPC, status de canibalização)
  - `Silo` (tipo: PILAR/APOIO/SATÉLITE, relação com keywords e posts)
  - Relação entre `Post` e `Keyword`/`Silo`

---

## Decisões sobre redes sociais

**Perfis de autor** (baixo esforço, sem integração de API):
- Campos de link (Twitter/X, LinkedIn, Instagram) no cadastro de autor
- Exibidos no `AuthorBio` já existente — só reforça E-E-A-T, não publica nada

**Conta da marca** (publicação automática ao agendar):
- Redes escolhidas: **Pinterest, Facebook e Instagram**
- Justificativa técnica: como o app só publica na própria conta da marca (não em contas de terceiros), qualifica para "Standard Access" no Meta — não precisa do processo completo de revisão de app nem verificação de negócio, que só é obrigatório para apps que publicam em contas de outras pessoas
- Ordem de implementação: **Pinterest primeiro** (mais simples, valida o conceito), depois **Facebook + Instagram juntos** (Instagram exige conta Business conectada a uma Página do Facebook, então compartilham a mesma base de autenticação)
- Instagram tem um fluxo de publicação em 3 etapas (criar container → aguardar processamento → publicar) — mais complexo que uma chamada simples, mas sem bloqueio de revisão externa no nosso caso
- Requisito prévio: converter a Página em Business/Creator no Facebook e Instagram antes da integração (etapa manual da pessoa)

---

## Fluxo detalhado de publicação social

Disparado automaticamente no momento em que o artigo é publicado (mesmo cron job do agendamento).

1. **Legenda**: gerada pela IA de texto (mesma API do Gemini usada para os artigos), adaptada ao tom/formato de cada rede
2. **Imagem**: reaproveita a capa já gerada para o artigo como base, mas **reenquadrada automaticamente por rede** (proporções diferentes exigem isso, senão a imagem corta mal ou fica com tarja):
   - Pinterest → vertical 2:3
   - Instagram → quadrado 1:1 ou vertical 4:5
   - Facebook → paisagem ~1.91:1 (próxima da imagem original, ajuste mínimo)
   - O próprio modelo de imagem (Nano Banana) reenquadra a imagem-base mantendo o assunto principal centralizado, em vez de corte mecânico — gerado automaticamente no momento da publicação, sem revisão manual (consistente com a decisão abaixo)
3. **Revisão**: **sem revisão humana** — publica automaticamente, sem etapa de aprovação (decisão da pessoa)
4. **Link por rede**:
   - Pinterest → link direto e clicável no Pin (funciona nativamente para tráfego)
   - Facebook → link direto e clicável no post
   - Instagram → **não suporta link clicável no post do feed** (limitação da própria plataforma). A legenda usa uma chamada tipo "link na bio", e o link da bio do Instagram precisa ser atualizado para apontar ao artigo mais recente (ou uma página com múltiplos links, se houver mais de uma publicação por período)
5. Formato em todas as redes: **imagem + texto**, nunca só texto

---

## Artigos de Review: dois formatos distintos

**1. Review individual** (já existente desde o Documento 5) — 1 produto por página, `/review/[slug]`, com pros/cons, nota, texto completo. Fontes pesquisadas pela IA com checagem humana obrigatória (decisão já registrada acima).

**2. Roundup** (novo tipo, este documento) — artigo tipo lista ("15 Melhores X"), que **referencia** Reviews individuais já existentes em vez de duplicar dados. Corresponde ao artigo Cabeça/Pilar da estrutura de Silo já definida; cada Review referenciado corresponde a um artigo de Apoio/Satélite.

### Estrutura do Roundup

```
H1: título com keyword ("Os X Melhores [Produto] de 2026")
Snippet/meta description para o Google
Disclosure de afiliado (visível na primeira tela)
Resumo rápido da escolha #1 (acima da dobra)
Tabela comparativa (imagem, nome, preço, nota, botão CTA) — puxada dos Reviews referenciados
Explicação geral sobre a categoria de produto
Para cada produto: nome, imagem, resumo curto (puxado do Review), pros/cons resumidos,
  botões "Ver na Amazon" / "Ver no Mercado Livre", link "Ver review completo" → /review/[slug]
FAQ no final
```

### Modelo de dados (novo)

- `Roundup`: título, slug, snippet/meta description, texto de introdução, disclosure, status, data de publicação/agendamento, autor
- `RoundupItem` (tabela de junção): `roundupId`, `reviewId`, posição/ranking — conecta o Roundup aos Reviews individuais sem duplicar conteúdo

### Linkagem cruzada (obrigatória)

- Cada linha da tabela do Roundup linka para o `/review/[slug]` completo daquele produto
- Cada página de Review individual mostra um link de volta: "Faz parte de: [Nome do Roundup]"

### Fluxo de geração pela IA

1. Tópico de silo Cabeça aprovado (ex: "15 Melhores Bicicletas Ergométricas")
2. IA identifica os produtos que entrarão na lista
3. Para cada produto: gera o Review individual completo primeiro (mesmo fluxo de pesquisa de fontes + checagem humana já definido)
4. Só depois monta o artigo Roundup, linkando automaticamente aos Reviews já aprovados
5. Roundup também precisa da checagem humana (fontes agregadas dos produtos que contém)

### Requisito técnico obrigatório

Todo link de afiliado (Amazon, Mercado Livre) deve ter os atributos `rel="sponsored"` (ou `rel="nofollow"`) no HTML — exigência do Google para não sofrer penalização manual por link não natural. Isso deve ser padrão no componente de botão de CTA, não uma escolha manual por artigo.

**Prompt de IA e template diferentes**: o prompt de geração de Roundup é distinto do prompt de Review individual (o Roundup não escreve prós/contras do zero, ele agrega dos Reviews já existentes). O template de página `/roundup/[slug]` também é visualmente diferente do `/review/[slug]` (foco em tabela comparativa vs. foco em texto corrido de 1 produto).

---

## Melhorias futuras (backlog, não bloqueiam o fluxo atual)

- **Importação de planilha (CSV/XLSX)** para Keywords, além da colagem manual em texto — útil quando as listas vierem de ferramentas de keyword research em volume maior. Adicionar quando o volume de importação justificar o esforço.
- **Calibrar o prompt de checagem de canibalização**: observado em teste que a IA tende a sinalizar canibalização com frequência alta, inclusive entre keywords com ângulos de busca claramente diferentes (ex: "emagrece" vs "para iniciantes" vs "quantas calorias queima" — todas cauda longa, mas com intenções distintas o suficiente pra justificar artigos separados). Ajustar o prompt para ser mais criterioso, evitando falso-positivo que descartaria conteúdo de Satélite válido.
- **Campo de preço no Review/Roundup**: campo `price` (opcional, String) adicionado ao Review. Preenchimento manual por enquanto. Quando a API de e-commerce/afiliado for liberada, trocar para preenchimento automático via API — sem necessidade de nova migration, só mudar a lógica de preenchimento.
- **Renovação automática do token do Meta (Facebook/Instagram)**: descoberto que o token de acesso de longa duração do Meta expira a cada 60 dias — não é configuração única. É necessário um job agendado (pode reaproveitar o mesmo mecanismo de cron) que renove o token antes de expirar, e um alerta/log se a renovação falhar, para não descobrir que a publicação parou de funcionar só quando um post não sair do jeito esperado.
- **Contas sociais: modelo simplificado (1 conta única por rede)**: decisão revisada — não haverá múltiplas Páginas por categoria. O blog terá apenas 1 Página do Facebook, 1 conta do Instagram e 1 conta do Pinterest, todas vinculadas à marca "Dr. Vinicius Azevedo". Token e IDs ficam fixos em variáveis de ambiente (`FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `PINTEREST_ACCESS_TOKEN`), sem seletor de página na hora de publicar.

---

- **Regra de classificação no Silo para nichos de review/produto**: esclarecido que, para conteúdo de review, o nível **Apoio** do silo corresponde a artigos tipo "Melhores X do mercado" (que devem virar **Roundup**), e o nível **Satélite** corresponde a reviews de produtos/marcas individuais específicos (que devem virar **Review** individual, sempre vinculados ao Roundup do Apoio correspondente). Exemplo: Apoio "As Melhores TVs HD do Mercado" (Roundup) → Satélites "Samsung TV X Review", "LG TV Y Review", etc. (Reviews individuais, 6-8 por Roundup tipicamente). O prompt de geração de estrutura de silo deve ser ajustado para aplicar essa regra automaticamente ao classificar keywords de nicho de produto, em vez de classificar livremente.

## Pendente / aguardando mais ideias da pessoa

Este documento será atualizado conforme novas decisões forem tomadas, antes de virar o Documento 6 (prompt de execução).

---
---

# ARQUITETURA REVISADA (sessão de definição — substitui/refina o modelo Pilar/Apoio/Satélite genérico anterior nas seções acima)

> Nota de nomenclatura: "Silo" tem dois usos formalizados abaixo — **Silo** (modelo de dados) é o agrupamento temático abstrato de keywords (já existente). **Artigo Silo** é o apelido de exibição no painel para o modelo de dados `Roundup` (já existente, sem necessidade de renomear a tabela) — o artigo que lista os produtos e referencia os Single Product Reviews.

## Os 5 tipos de conteúdo (glossário fechado)

1. **Single Product Review** (modelo `Review`) — review de 1 produto único (marca+modelo), aprofundado. Tem link de afiliado (Amazon e/ou Mercado Livre).
2. **Artigo Silo** (modelo `Roundup`) — lista de 1 a 15 produtos (quantidade configurável), cada um referenciando um Single Product Review existente. Comercial.
3. **Apoio** (modelo `Post`, campo tipo=APOIO) — recorte comercial mais estreito do nicho (ex: "Qual o Melhor Frigobar Retrô"). Tem link de afiliado para 1 produto específico (que também está listado no Artigo Silo).
4. **Informacional** (modelo `Post`, campo tipo=INFORMACIONAL) — conteúdo puro, sem CTA de afiliado, sem o campo de link sequer aparecer no formulário.
5. **Comparação** (modelo `Post`, campo tipo=COMPARACAO) — "Produto A vs Produto B", só criado quando há demanda de busca real e comprovada para aquele par específico (nunca gerado por combinatória entre os N produtos do silo). Linka para os 2 Single Product Reviews comparados + para o Artigo Silo.

## Meta de proporção de conteúdo

~70% dos artigos satélite de um Silo devem ser Informacionais, ~30% comerciais (Single Product Review + Apoio + Comparação), refletindo a distribuição real de intenção de busca (dado de mercado: ~70% das buscas são informacionais).

## Regras de linkagem interna (obrigatórias no prompt de geração)

- **Artigo Silo ↔ Single Product Review**: bidirecional (Silo linka para cada produto listado; cada produto linka de volta para o Silo)
- **Apoio → Artigo Silo**: unidirecional (Apoio linka para o Silo; Silo não linka de volta)
- **Informacional → Artigo Silo**: unidirecional (mesma lógica do Apoio)
- **Comparação → Artigo Silo + 2 Single Product Reviews comparados**: unidirecional para o Silo; pode linkar para os 2 reviews comparados
- **Single Product Reviews não linkam lateralmente entre si** (decisão revisada — descartado o modelo de "circular chain")
- **Silos diferentes nunca linkam entre si** (preserva força de sinal temático de cada silo)

## Ordem de criação (respeita dependência de link)

```
1º — Single Product Reviews (todos os produtos do silo)
2º — Artigo Silo (depende do 1º, referencia os produtos)
3º — Apoio, Informacional, Comparação (dependem do 2º; Comparação também do 1º)
```

## Formato de conteúdo por tipo de busca (força correspondência ao formato de featured snippet do Google, não deixado à IA)

| Tipo de busca | Formato exigido | Aplica-se a |
|---|---|---|
| "Como fazer/montar/limpar X" | Lista numerada, 5-8 passos | Informacional (processo) |
| "O que é X" / "X faz Y?" | Parágrafo direto, 40-60 palavras, resposta logo após o H2 | Informacional (definição) |
| "Melhor X" | Lista com marcadores + tabela comparativa | Artigo Silo, Apoio |
| "X vs Y" | Tabela | Comparação |
| Avaliação de produto | Critérios explícitos + evidência + limitações + CTA progressivo | Single Product Review |

Regra geral: cada seção H2 responde exatamente 1 pergunta/subtema (nunca combinar 2 perguntas num heading); resposta direta nos primeiros 100-150 palavras da seção, sem preâmbulo.

## Layout visual do Artigo Silo (lista de produtos)

```
H1 + snippet (meta description)
Disclosure de afiliado (topo, primeira tela)
Resumo rápido da escolha #1
Tabela comparativa (imagem, nome, nota, botões CTA)
Texto de introdução sobre a categoria
Para cada produto (espaçamento generoso entre eles):
  - Imagem grande
  - Resenha curta + prós/contras
  - 2 botões de CTA (Amazon/Mercado Livre) com HIERARQUIA VISUAL
    (1 primário com mais destaque, 1 secundário mais discreto —
    não os dois com peso visual igual)
  - Linha curta de confiança acima do CTA (nota, frete, garantia — se houver dado)
  - Link "Ver review completo" → Single Product Review
FAQ (se gerado)
```

Todo link de afiliado usa `rel="sponsored nofollow"` (já implementado no componente `AffiliateButton`).

## Fluxo de telas no painel (revisão do fluxo original)

```
1. Gerar Estrutura
   Pessoa digita 1 keyword semente → IA gera árvore completa
   (Single Product Reviews + Artigo Silo + Apoio + Informacional + Comparação,
   já com keywords definidas e tipo classificado, respeitando a proporção 70/30
   e o filtro de demanda real para Comparação)
   Pessoa aprova a estrutura

2. Fila de Criação
   Lista todos os artigos do Silo, na ordem de dependência (ver acima)
   Cada item abre formulário inline com campos que variam por tipo:
   título, tópicos (outline editável), imagens, produtos/links de afiliado
   (regras de obrigatoriedade por tipo — ver tabela), categoria, autor
   Pessoa edita/aprova tópicos antes da geração do texto completo
   (funciona como gate de qualidade para todos os tipos, incluindo Informacional)
   Ao salvar, artigo sai da Fila de Criação

3. Fila de Publicação
   Lista artigos com conteúdo já gerado
   Pessoa agenda dia/hora de cada um
   Sistema não permite agendar um item antes de suas dependências de link
   (ex: não deixa agendar Artigo Silo antes de todos os Single Product
   Reviews que ele referencia estarem, no mínimo, também agendados)

4. Após salvar/aprovar uma estrutura completa, a tela de Gerar Estrutura
   reseta, pronta para uma nova keyword semente (novo Silo, sem relação
   com os anteriores) — permite alimentar o blog com múltiplos nichos
   ao longo do tempo, cada um como Silo independente
```

Menu lateral revisado: Dashboard, Keywords, Gerar Estrutura, Fila de Criação, Fila de Publicação, Categorias, Autores. As telas antigas (`/admin/posts`, `/admin/reviews`, `/admin/roundups`) continuam existindo como modelos de dados por baixo, mas a navegação principal do dia a dia passa a ser pela Fila de Criação, não por essas telas individualmente.

## Chave de API dedicada

`GEMINI_STRUCTURE_API_KEY` — chave separada das já existentes (texto/imagem), usada especificamente para a geração da árvore de estrutura (Gerar Estrutura), permitindo rastrear custo dessa função isoladamente.

## Princípio de supervisão humana (reafirmado)

A estrutura não é gerada de forma autônoma pela IA — a pessoa fornece a keyword semente e revisa/aprova a estrutura proposta antes de qualquer conteúdo ser gerado. A IA aplica as regras documentadas acima; não decide a arquitetura. Isso é consistente com os checkpoints humanos já existentes no pipeline (aprovação de keyword, canibalização, estrutura, tópicos, fontes de review).

## Pendências conscientemente adiadas

- **Revisão de segurança da `SUPABASE_SERVICE_ROLE_KEY`**: usada na automação do cron (Documento 8) para operações sem sessão humana (upload de imagem, etc.). Sistema não é multi-usuário no momento. Revisão de segurança formal fica agendada para quando o sistema estiver em operação real, não antes.
- **Gate de qualidade para Informacional**: avaliado e decidido que não é necessário replicar a checagem obrigatória de fontes (como existe para Review) — a curadoria manual de tópicos pela pessoa antes da geração do texto completo já cumpre esse papel.
