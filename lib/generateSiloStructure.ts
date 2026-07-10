import { GoogleGenAI, Type } from '@google/genai';

export type StructureItemType =
  | 'SINGLE_PRODUCT_REVIEW'
  | 'ARTIGO_SILO'
  | 'APOIO'
  | 'INFORMACIONAL'
  | 'COMPARACAO';

export type SearchIntentFormat =
  | 'lista_numerada'
  | 'paragrafo_direto'
  | 'lista_marcadores_tabela'
  | 'tabela'
  | 'criterios_evidencia';

export type StructureItem = {
  type: StructureItemType;
  keyword: string;
  title: string;
  searchIntentFormat: SearchIntentFormat;
  comparedProducts?: [string, string];
};

export type StructureProposal = {
  silo: { name: string; seedKeyword: string };
  items: StructureItem[];
};

const SYSTEM_PROMPT = `Você é um planejador de arquitetura de conteúdo SEO. Você NÃO decide a
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
INFORMACIONAL deve ter um \`searchIntentFormat\` condizente com o tipo
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
}`;

export async function generateSiloStructure(seedKeyword: string): Promise<StructureProposal> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_STRUCTURE_API_KEY! });

  const prompt = `${SYSTEM_PROMPT}

Keyword semente fornecida pelo usuário: "${seedKeyword}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          silo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              seedKeyword: { type: Type.STRING },
            },
            required: ['name', 'seedKeyword'],
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  enum: ['SINGLE_PRODUCT_REVIEW', 'ARTIGO_SILO', 'APOIO', 'INFORMACIONAL', 'COMPARACAO'],
                },
                keyword: { type: Type.STRING },
                title: { type: Type.STRING },
                searchIntentFormat: {
                  type: Type.STRING,
                  enum: ['lista_numerada', 'paragrafo_direto', 'lista_marcadores_tabela', 'tabela', 'criterios_evidencia'],
                },
                comparedProducts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  nullable: true,
                },
              },
              required: ['type', 'keyword', 'title', 'searchIntentFormat'],
            },
          },
        },
        required: ['silo', 'items'],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error('A IA não retornou uma resposta.');

  let parsed: StructureProposal;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Não foi possível interpretar a resposta da IA.');
  }

  return parsed;
}
