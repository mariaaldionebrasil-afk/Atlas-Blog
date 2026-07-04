# PROJECT ATLAS — Blog Structure Engine
## Documento 8 de 8: Publicação Social (Pinterest, Facebook, Instagram)

> **Instrução para o Claude Code:** os Documentos 1-7 já foram concluídos. A Etapa 0 é manual (feita pela pessoa, com várias sub-etapas em plataformas externas). As demais são para você executar, parando ao final de cada uma.

Referência: `06-especificacao-esteira-conteudo.md`, seção "Decisões sobre redes sociais" e "Fluxo detalhado de publicação social".

---

## Etapa 0 — Ação manual (feita pela pessoa)

### Pinterest
1. Criar conta de desenvolvedor em https://developers.pinterest.com
2. Criar um app, gerar token de acesso
3. Guardar `PINTEREST_ACCESS_TOKEN`

### Facebook + Instagram
1. Converter a Página do Facebook da marca em Business (se ainda não for)
2. Converter a conta do Instagram da marca em Business/Creator, e conectá-la à Página do Facebook
3. Ir em https://developers.facebook.com, criar um app tipo Business
4. Adicionar o produto "Instagram Graph API" ao app
5. Gerar um token de acesso de longa duração para a Página
6. Guardar: `FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`

Adicionar todas essas variáveis no `.env.local` e nas Environment Variables da Vercel.

---

## Etapa 1 — Reenquadramento de imagem por rede

Criar `/lib/reframeImage.ts`: recebe a imagem de capa (URL do Supabase Storage) e uma proporção alvo, usa o modelo de imagem (Nano Banana) para reenquadrar mantendo o assunto principal centralizado, salva a variante no Supabase Storage, retorna a nova URL.

Proporções necessárias:
- Pinterest: 2:3 (vertical)
- Instagram: 1:1 ou 4:5
- Facebook: ~1.91:1 (ajuste mínimo, pode reaproveitar a original na maioria dos casos)

**Verificação:** rodar um teste isolado gerando as 3 variantes a partir de 1 imagem de capa existente, confirmar que aparecem corretamente no Supabase Storage.

---

## Etapa 2 — Geração de legenda por rede

Criar `/lib/generateSocialCaption.ts`: recebe o artigo (título, resumo) e a rede-alvo, usa a IA de texto para gerar uma legenda adaptada ao tom e formato daquela rede (Pinterest é mais descritivo/palavra-chave, Instagram usa hashtags, Facebook é mais neutro). Para Instagram, a legenda deve incluir uma chamada tipo "link na bio" (Instagram não suporta link clicável no post do feed).

**Verificação:** gerar as 3 legendas para 1 artigo de teste, confirmar que são visivelmente diferentes em tom/formato entre as redes.

---

## Etapa 3 — Publicação no Pinterest

Criar `/lib/publishToPinterest.ts`: usa a API do Pinterest para criar um Pin com a imagem reenquadrada (2:3), a legenda gerada, e o **link direto para o artigo/review/roundup publicado**.

**Verificação:** publicar 1 pin de teste manualmente (chamando a função isolada), confirmar que aparece na conta do Pinterest com imagem, texto e link corretos.

---

## Etapa 4 — Publicação no Facebook

Criar `/lib/publishToFacebook.ts`: usa a Graph API para publicar na Página, com imagem (proporção ~1.91:1) + legenda + **link clicável direto** para o artigo.

**Verificação:** publicar 1 post de teste, confirmar na Página do Facebook.

---

## Etapa 5 — Publicação no Instagram

Criar `/lib/publishToInstagram.ts`, seguindo o fluxo de 3 etapas da Graph API:
1. Criar container de mídia (imagem 1:1 ou 4:5 + legenda)
2. Aguardar o processamento do container
3. Publicar o container

Sem link clicável no post (limitação da plataforma) — a legenda já contém a chamada "link na bio" (Etapa 2).

**Verificação:** publicar 1 post de teste, confirmar que aparece corretamente no feed do Instagram da marca.

---

## Etapa 6 — Integrar publicação social ao cron de agendamento

Estender a API route `/app/api/cron/publish/route.ts` (criada no Documento 6): sempre que um Post, Review ou Roundup mudar de `SCHEDULED` para `PUBLISHED`, disparar em sequência:

1. `reframeImage.ts` para as 3 proporções
2. `generateSocialCaption.ts` para as 3 redes
3. `publishToPinterest.ts`, `publishToFacebook.ts`, `publishToInstagram.ts`

**Sem revisão humana antes de publicar nas redes** (decisão já registrada na especificação) — roda tudo automaticamente no momento da publicação.

**Verificação:** agendar 1 artigo de teste para "daqui a 3 minutos", confirmar que ele: (1) vira `PUBLISHED` no site, (2) aparece automaticamente nas 3 redes sociais com imagem e legenda corretas. Reverter/apagar o conteúdo de teste depois.

---

## Etapa 7 — Tratamento de erro

Cada função de publicação (`publishToPinterest`, `publishToFacebook`, `publishToInstagram`) deve:
- Rodar de forma independente (se uma rede falhar, as outras continuam)
- Registrar o erro em log (não travar o cron nem impedir a publicação do artigo no site)
- Se possível, salvar um registro simples de "publicação social falhou" visível no painel, para a pessoa saber que precisa postar manualmente naquela rede

**Verificação:** simular uma falha (ex: token inválido temporariamente) em 1 rede e confirmar que as outras duas publicam normalmente mesmo assim.

---

## Checklist final do Documento 8

1. Imagem reenquadrada automaticamente por rede
2. Legenda gerada e adaptada por rede
3. Pinterest publica com link direto
4. Facebook publica com link direto
5. Instagram publica (sem link direto, com chamada "link na bio")
6. Tudo disparado automaticamente pelo cron, sem revisão manual
7. Falha em 1 rede não trava as outras
8. `npm run build` sem erros, commit e push feitos

---

## Projeto completo

Com este documento concluído, a esteira de conteúdo está fechada de ponta a ponta: keywords → silo → tópicos → artigo → revisão → agendamento → publicação no site → publicação social automática.

Próximos passos ficam fora do escopo destes documentos:
- Popular a esteira com keywords reais e acompanhar os primeiros resultados
- Ajustar prompts de geração conforme a qualidade observada
- Fechar parcerias e cadastrar novos autores reais conforme combinado
- Atualizar o link da bio do Instagram manualmente (ou considerar uma página tipo "link em bio" própria, se o volume de publicação crescer)
