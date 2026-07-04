'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { GoogleGenAI, Type } from '@google/genai';
import { slugify } from '@/lib/slugify';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function researchAndGenerateReview(keywordId: string, authorId: string) {
  await requireAdmin();

  const keyword = await prisma.keyword.findUnique({ where: { id: keywordId } });
  if (!keyword) return { error: 'Keyword não encontrada.' };

  const existing = await prisma.review.findFirst({ where: { keywordId } });
  if (existing) return { error: 'Já existe um review para esta keyword.', reviewId: existing.id };

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  // 1ª chamada: pesquisa real via Grounding com Google Search (não é compatível com JSON estruturado)
  const researchResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Pesquise reviews e testes reais sobre o produto "${keyword.term}" e escreva um review completo em português do Brasil, em texto corrido.

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

  // 2ª chamada: extrai dados estruturados a partir do texto já pesquisado (sem grounding, sem conflito com JSON mode)
  const structuredResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `A partir deste review de produto, extraia os dados estruturados abaixo.

Review:
"""
${reviewText}
"""

Produto: "${keyword.term}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['productName', 'rating', 'summary', 'pros', 'cons'],
      },
    },
  });

  const structuredText = structuredResponse.text;
  if (!structuredText) return { error: 'A IA não retornou os dados estruturados.' };

  let structured: {
    productName: string;
    rating: number;
    summary: string;
    pros: string[];
    cons: string[];
  };
  try {
    structured = JSON.parse(structuredText);
  } catch {
    return { error: 'Não foi possível interpretar os dados estruturados da IA.' };
  }

  const baseSlug = slugify(structured.productName || keyword.term);
  let slug = baseSlug;
  let counter = 2;
  while (await prisma.review.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const review = await prisma.review.create({
    data: {
      slug,
      productName: structured.productName || keyword.term,
      rating: structured.rating,
      summary: structured.summary,
      content: reviewText,
      pros: structured.pros,
      cons: structured.cons,
      status: 'DRAFT',
      authorId,
      keywordId,
      sourceUrls,
    },
  });

  revalidatePath('/admin/keywords');
  revalidatePath('/admin/reviews');
  redirect(`/admin/reviews/${review.id}/approve`);
}
