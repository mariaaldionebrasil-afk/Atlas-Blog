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

## Pendente / aguardando mais ideias da pessoa

Este documento será atualizado conforme novas decisões forem tomadas, antes de virar o Documento 6 (prompt de execução).
