'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI, Type } from '@google/genai';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export type OutlineTopic = { level: 'H2' | 'H3'; text: string };
export type ItemKind = 'REVIEW' | 'ROUNDUP' | 'POST';

async function loadItemKeywordContext(kind: ItemKind, itemId: string) {
  if (kind === 'REVIEW') {
    const review = await prisma.review.findUnique({
      where: { id: itemId },
      include: { keyword: { include: { silo: true } } },
    });
    return review?.keyword ?? null;
  }
  if (kind === 'ROUNDUP') {
    const roundup = await prisma.roundup.findUnique({
      where: { id: itemId },
      include: { keyword: { include: { silo: true } } },
    });
    return roundup?.keyword ?? null;
  }
  const post = await prisma.post.findUnique({
    where: { id: itemId },
    include: { keyword: { include: { silo: true } } },
  });
  return post?.keyword ?? null;
}

export async function generateOutlineForItem(
  kind: ItemKind,
  itemId: string
): Promise<{ topics: OutlineTopic[] } | { error: string }> {
  await requireAdmin();

  const keyword = await loadItemKeywordContext(kind, itemId);
  if (!keyword) return { error: 'Keyword não encontrada para este item.' };

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  const prompt = `Proponha um outline (estrutura de tópicos H2 e H3) para um artigo de blog otimizado para a keyword "${keyword.term}"${
    keyword.searchIntent ? ` (intenção de busca: ${keyword.searchIntent})` : ''
  }${keyword.silo ? `, que faz parte do silo "${keyword.silo.name}"` : ''}.

Gere entre 5 e 10 tópicos no total, misturando H2 (seções principais) e H3 (subseções, quando fizer sentido aninhar sob um H2 anterior). Responda em JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING, enum: ['H2', 'H3'] },
                text: { type: Type.STRING },
              },
              required: ['level', 'text'],
            },
          },
        },
        required: ['topics'],
      },
    },
  });

  const text = response.text;
  if (!text) return { error: 'A IA não retornou uma resposta.' };

  try {
    const parsed = JSON.parse(text) as { topics: OutlineTopic[] };
    return { topics: parsed.topics };
  } catch {
    return { error: 'Não foi possível interpretar a resposta da IA.' };
  }
}

export async function saveItemOutline(kind: ItemKind, itemId: string, topics: OutlineTopic[]) {
  await requireAdmin();

  if (kind === 'REVIEW') {
    await prisma.review.update({ where: { id: itemId }, data: { outline: topics } });
  } else if (kind === 'ROUNDUP') {
    await prisma.roundup.update({ where: { id: itemId }, data: { outline: topics } });
  } else {
    await prisma.post.update({ where: { id: itemId }, data: { outline: topics } });
  }

  revalidatePath('/admin/creation-queue');
}

export async function generateReviewForSkeleton(reviewId: string): Promise<{ success?: true; error?: string }> {
  await requireAdmin();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { keyword: true },
  });
  if (!review) return { error: 'Review não encontrado.' };

  const outline = (review.outline as unknown as OutlineTopic[] | null) ?? [];
  const term = review.keyword?.term ?? review.productName;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  const researchResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Pesquise reviews e testes reais sobre o produto "${term}" e escreva um review completo em português do Brasil, em texto corrido.
${outline.length > 0 ? `\nCubra ao menos estes tópicos, na ordem: ${outline.map((t) => t.text).join('; ')}.` : ''}

Regras:
- Baseie-se em informações reais encontradas na pesquisa (características, preço aproximado, prós, contras, experiência de uso relatada por outras pessoas/sites).
- NUNCA copie trechos longos literalmente — sempre parafraseie com suas próprias palavras.
- Estruture o texto com seções usando "## Título da seção" (ex: ## Visão Geral, ## Prós e Contras, ## Vale a Pena?).
- Escreva de forma acessível e imparcial, mencionando tanto pontos positivos quanto negativos.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const reviewText = researchResponse.text;
  if (!reviewText) return { error: 'A IA não retornou conteúdo de pesquisa.' };

  const groundingChunks = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sourceUrls = groundingChunks
    .map((chunk) => chunk.web)
    .filter((web): web is { uri?: string; title?: string } => Boolean(web?.uri))
    .map((web) => ({ title: web.title ?? web.uri!, url: web.uri! }));

  const structuredResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `A partir deste review de produto, extraia os dados estruturados abaixo.

Review:
"""
${reviewText}
"""

Produto: "${term}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rating: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['rating', 'summary', 'pros', 'cons'],
      },
    },
  });

  const structuredText = structuredResponse.text;
  if (!structuredText) return { error: 'A IA não retornou os dados estruturados.' };

  let structured: { rating: number; summary: string; pros: string[]; cons: string[] };
  try {
    structured = JSON.parse(structuredText);
  } catch {
    return { error: 'Não foi possível interpretar os dados estruturados da IA.' };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: structured.rating,
      summary: structured.summary,
      content: reviewText,
      pros: structured.pros,
      cons: structured.cons,
      sourceUrls,
    },
  });

  revalidatePath('/admin/creation-queue');
  return { success: true };
}

export async function generateRoundupContent(roundupId: string): Promise<{ success?: true; error?: string }> {
  await requireAdmin();

  const roundup = await prisma.roundup.findUnique({
    where: { id: roundupId },
    include: { items: { include: { review: true, post: true }, orderBy: { position: 'asc' } } },
  });
  if (!roundup) return { error: 'Artigo Silo não encontrado.' };
  if (roundup.items.length < 2) return { error: 'Selecione e salve ao menos 2 itens antes de gerar o texto.' };

  const outline = (roundup.outline as unknown as OutlineTopic[] | null) ?? [];

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  const itemDescriptions = roundup.items.map((i) =>
    i.review
      ? `- produto: "${i.review.productName}" | nota: ${i.review.rating ?? '?'} | resumo: ${i.review.summary}`
      : `- artigo: "${i.post!.title}"`
  );

  const prompt = `Monte a introdução de um roundup ("${roundup.title}") a partir destes itens já existentes:

${itemDescriptions.join('\n')}
${outline.length > 0 ? `\nCubra estes tópicos na introdução: ${outline.map((t) => t.text).join('; ')}.` : ''}

Gere:
- snippet: meta description curta (1-2 frases) para o Google
- introContent: texto de introdução sobre a categoria de produto, 2 a 4 parágrafos separados por uma linha em branco

Responda em JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          snippet: { type: Type.STRING },
          introContent: { type: Type.STRING },
        },
        required: ['snippet', 'introContent'],
      },
    },
  });

  const text = response.text;
  if (!text) return { error: 'A IA não retornou uma resposta.' };

  let parsed: { snippet: string; introContent: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'Não foi possível interpretar a resposta da IA.' };
  }

  await prisma.roundup.update({
    where: { id: roundupId },
    data: { snippet: parsed.snippet, introContent: parsed.introContent },
  });

  revalidatePath('/admin/creation-queue');
  return { success: true };
}

export type SiloItemOption = { id: string; title: string; kind: 'REVIEW' | 'POST'; status: string };

export async function getSiloItemOptions(siloId: string): Promise<SiloItemOption[]> {
  await requireAdmin();

  const [reviews, posts] = await Promise.all([
    prisma.review.findMany({
      where: { keyword: { siloId } },
      select: { id: true, productName: true, status: true },
      orderBy: { productName: 'asc' },
    }),
    prisma.post.findMany({
      where: { keyword: { siloId }, postType: 'INFORMACIONAL' },
      select: { id: true, title: true, status: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  return [
    ...reviews.map((r): SiloItemOption => ({ id: r.id, title: r.productName, kind: 'REVIEW', status: r.status })),
    ...posts.map((p): SiloItemOption => ({ id: p.id, title: p.title, kind: 'POST', status: p.status })),
  ];
}

export async function saveReviewMeta(input: {
  id: string;
  categoryId: string;
  authorId: string;
  coverImage: string;
  affiliateLinkAmazon: string;
  affiliateLinkMercadoLivre: string;
}): Promise<{ success?: true; error?: string }> {
  await requireAdmin();

  if (!input.affiliateLinkAmazon && !input.affiliateLinkMercadoLivre) {
    return { error: 'Preencha ao menos um link de afiliado (Amazon ou Mercado Livre).' };
  }

  await prisma.review.update({
    where: { id: input.id },
    data: {
      categoryId: input.categoryId,
      authorId: input.authorId,
      coverImage: input.coverImage || null,
      affiliateLinkAmazon: input.affiliateLinkAmazon || null,
      affiliateLinkMercadoLivre: input.affiliateLinkMercadoLivre || null,
    },
  });

  revalidatePath('/admin/creation-queue');
  return { success: true };
}

export async function saveRoundupMeta(input: {
  id: string;
  categoryId: string;
  authorId: string;
  itemRefs: { kind: 'REVIEW' | 'POST'; id: string }[];
}): Promise<{ success?: true; error?: string }> {
  await requireAdmin();

  if (input.itemRefs.length === 0) {
    return { error: 'Selecione ao menos 1 item.' };
  }
  if (input.itemRefs.length > 15) {
    return { error: 'No máximo 15 itens por Artigo Silo.' };
  }

  await prisma.roundup.update({
    where: { id: input.id },
    data: { categoryId: input.categoryId, authorId: input.authorId },
  });

  await prisma.roundupItem.deleteMany({ where: { roundupId: input.id } });
  await prisma.roundupItem.createMany({
    data: input.itemRefs.map((ref, index) => ({
      roundupId: input.id,
      reviewId: ref.kind === 'REVIEW' ? ref.id : null,
      postId: ref.kind === 'POST' ? ref.id : null,
      position: index,
    })),
  });

  revalidatePath('/admin/creation-queue');
  return { success: true };
}

export async function savePostMeta(input: {
  id: string;
  categoryId: string;
  authorId: string;
  coverImage: string;
  affiliateLinkAmazon?: string;
  affiliateLinkMercadoLivre?: string;
  comparedReviewIdA?: string;
  comparedReviewIdB?: string;
}): Promise<{ success?: true; error?: string }> {
  await requireAdmin();

  const post = await prisma.post.findUnique({ where: { id: input.id } });
  if (!post) return { error: 'Post não encontrado.' };

  if (post.postType === 'APOIO' && !input.affiliateLinkAmazon && !input.affiliateLinkMercadoLivre) {
    return { error: 'Preencha ao menos um link de afiliado (Amazon ou Mercado Livre).' };
  }
  if (post.postType === 'COMPARACAO' && (!input.comparedReviewIdA || !input.comparedReviewIdB)) {
    return { error: 'Selecione os 2 produtos comparados.' };
  }

  await prisma.post.update({
    where: { id: input.id },
    data: {
      categoryId: input.categoryId,
      authorId: input.authorId,
      coverImage: input.coverImage || null,
      affiliateLinkAmazon: post.postType === 'APOIO' ? input.affiliateLinkAmazon || null : undefined,
      affiliateLinkMercadoLivre: post.postType === 'APOIO' ? input.affiliateLinkMercadoLivre || null : undefined,
      comparedReviewIdA: post.postType === 'COMPARACAO' ? input.comparedReviewIdA : undefined,
      comparedReviewIdB: post.postType === 'COMPARACAO' ? input.comparedReviewIdB : undefined,
    },
  });

  revalidatePath('/admin/creation-queue');
  return { success: true };
}
