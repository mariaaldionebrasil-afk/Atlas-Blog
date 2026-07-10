# PROJECT ATLAS — Blog Structure Engine
## Documento 10 de 10: Fila de Criação, Fila de Publicação e Fluxo Final

> **Instrução para o Claude Code:** o Documento 9 já foi concluído (schema, Gerar Estrutura, prompts). Este documento constrói a interface que transforma a estrutura aprovada em conteúdo publicado. Sem etapa manual — pode começar direto pela Etapa 1.

---

## Etapa 1 — Tela "Fila de Criação"

Criar `/app/admin/creation-queue/page.tsx`:

**Lista principal:**
- Mostra todos os itens de estruturas aprovadas que ainda não têm conteúdo completo gerado
- Ordenados respeitando a dependência: todos os `SINGLE_PRODUCT_REVIEW` de um silo aparecem antes do `ARTIGO_SILO` correspondente, que aparece antes de `APOIO`/`INFORMACIONAL`/`COMPARACAO` daquele mesmo silo
- Cada item mostra: título, tipo (badge colorido por tipo), silo a que pertence, status

**Ao clicar em um item, abrir formulário inline** (não navegar para outra página) com campos que variam por tipo:

| Campo | SPR | Artigo Silo | Apoio | Informacional | Comparação |
|---|---|---|---|---|---|
| Título | editável | editável | editável | editável | editável |
| Tópicos (outline) | gerado + editável | gerado + editável | gerado + editável | gerado + editável | gerado + editável |
| Imagem | gerar IA ou URL | gerar IA ou URL (por produto) | gerar IA ou URL | gerar IA ou URL | gerar IA ou URL |
| Link Amazon | campo visível, obrigatório | — | campo visível, obrigatório | **campo não aparece** | — |
| Link Mercado Livre | campo visível, obrigatório* | — | campo visível, obrigatório* | **campo não aparece** | — |
| Produtos incluídos (1-15) | — | seletor múltiplo dos SPRs já criados neste silo | — | — | seletor de exatos 2 SPRs já criados neste silo |
| Categoria | obrigatório | obrigatório | obrigatório | obrigatório | obrigatório |
| Autor | obrigatório | obrigatório | obrigatório | obrigatório | obrigatório |

\* pelo menos 1 dos 2 links deve estar preenchido, não precisam ser os 2

**Botão "Gerar texto completo"** dentro do formulário: dispara a geração via IA (usando o outline aprovado + o `searchIntentFormat` de cada seção, conforme Documento 9 Etapa 4), aplicando texto + imagens automaticamente.

**Botão "Salvar"**: salva o conteúdo gerado (ou editado manualmente), remove o item da Fila de Criação, item passa a aparecer na Fila de Publicação (Etapa 2).

**Trava de tipo:** o formulário não deve renderizar campos que não se aplicam ao tipo (ex: literalmente não incluir o componente de link de afiliado no DOM quando tipo = INFORMACIONAL, não só ocultar visualmente).

**Verificação:**
1. Abrir um item tipo Informacional, confirmar que não existe nenhum campo de link de afiliado na tela (inspecionar o HTML, não só visualmente)
2. Abrir um item tipo Artigo Silo, confirmar que o seletor de produtos lista corretamente os Single Product Reviews já criados no mesmo silo
3. Gerar texto completo de 1 item de cada tipo, confirmar que o formato de seção varia conforme o Documento 9 Etapa 4

---

## Etapa 2 — Tela "Fila de Publicação"

Criar `/app/admin/publish-queue/page.tsx`:

- Lista os itens com conteúdo já gerado, aguardando agendamento
- Cada item: título, tipo, campo de data/hora, botão "Aprovar e agendar"
- **Trava de dependência**: ao tentar agendar um `ARTIGO_SILO`, o sistema verifica se todos os `SINGLE_PRODUCT_REVIEW` que ele referencia já estão, no mínimo, também agendados (`SCHEDULED` ou `PUBLISHED`) — se não, bloquear com mensagem clara indicando quais produtos faltam agendar primeiro
- Mesma trava para `COMPARACAO` (os 2 reviews comparados precisam estar agendados/publicados antes)
- `APOIO`/`INFORMACIONAL` são bloqueados até o `ARTIGO_SILO` do mesmo silo estar agendado/publicado

**Verificação:**
1. Tentar agendar um Artigo Silo antes de seus produtos — confirmar que bloqueia com mensagem clara
2. Agendar os Single Product Reviews primeiro, depois o Artigo Silo — confirmar que libera
3. Confirmar que o cron (já existente desde o Documento 6) continua publicando corretamente esses novos tipos

---

## Etapa 3 — Reset da tela "Gerar Estrutura"

Ajustar `/app/admin/generate-structure/page.tsx` (Documento 9): após o clique em "Aprovar e salvar estrutura", limpar todos os campos e o resultado exibido, deixando a tela pronta para receber uma nova keyword semente imediatamente, sem necessidade de recarregar a página.

**Verificação:** aprovar uma estrutura, confirmar que a tela volta ao estado inicial (campo de keyword vazio, sem árvore exibida) sem erro.

---

## Etapa 4 — Ajuste do menu lateral do admin

Atualizar `/app/admin/layout.tsx`:

```
Dashboard
Keywords
Gerar Estrutura
Fila de Criação
Fila de Publicação
Categorias
Autores
```

Remover do menu principal os links diretos para `/admin/posts`, `/admin/reviews`, `/admin/roundups` (essas rotas continuam existindo tecnicamente, só não ficam mais em destaque na navegação — o fluxo principal passa pela Fila de Criação).

**Verificação:** navegação lateral reflete a lista acima, todas as rotas carregam sem erro 404.

---

## Etapa 5 — Teste de ponta a ponta

Com uma keyword de teste nova (ex: "esteira ergométrica" ou qualquer nicho ainda não usado):

1. Gerar Estrutura → confirmar árvore com proporção ~70/30 e ao menos 1 exemplo de cada tipo (SPR, Artigo Silo, Apoio, Informacional; Comparação opcional se houver justificativa)
2. Aprovar estrutura
3. Na Fila de Criação, completar pelo menos: 2 Single Product Reviews, 1 Artigo Silo (referenciando os 2), 1 Apoio, 1 Informacional
4. Confirmar que a ordem de dependência foi respeitada automaticamente na lista
5. Ir para Fila de Publicação, tentar agendar o Artigo Silo antes dos produtos (deve bloquear), depois agendar na ordem certa
6. Aguardar ou forçar o cron, confirmar publicação no site público com a linkagem correta (Silo ↔ SPRs, Apoio → Silo)
7. Confirmar que o Informacional não tem nenhum CTA de afiliado na página pública

---

## Checklist final do Documento 10

1. Fila de Criação funcional, campos corretos por tipo
2. Fila de Publicação com trava de dependência funcionando
3. Reset automático da tela Gerar Estrutura
4. Menu lateral atualizado
5. Teste de ponta a ponta completo com sucesso
6. `npm run build` sem erros, commit e push feitos

---

## Projeto pronto para teste prático

Com os Documentos 9 e 10 concluídos, o sistema completo está pronto: da keyword semente até a publicação automática no site e nas redes sociais, respeitando toda a arquitetura de conteúdo definida (5 tipos, proporção 70/30, regras de linkagem, formato por SERP). A partir daqui, o teste real é alimentar o blog com keywords de verdade e observar os resultados.
