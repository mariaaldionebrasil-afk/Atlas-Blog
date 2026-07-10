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

export type EligibleReview = {
  id: string;
  productName: string;
  rating: number | null;
  summary: string;
};

export async function getEligibleReviewsForPilar(siloId: string): Promise<EligibleReview[]> {
  await requireAdmin();

  const children = await prisma.silo.findMany({ where: { parentId: siloId } });
  const grandchildren = await prisma.silo.findMany({
    where: { parentId: { in: children.map((c) => c.id) } },
  });
  const descendantIds = [...children.map((c) => c.id), ...grandchildren.map((c) => c.id)];

  const reviews = await prisma.review.findMany({
    where: {
      status: { in: ['SCHEDULED', 'PUBLISHED'] },
      keyword: { siloId: { in: descendantIds } },
    },
    select: { id: true, productName: true, rating: true, summary: true },
  });

  return reviews;
}

export async function generateRoundup(siloId: string, authorId: string, reviewIds: string[]) {
  await requireAdmin();

  if (reviewIds.length < 2) {
    return { error: 'Selecione ao menos 2 reviews.' };
  }

  const silo = await prisma.silo.findUnique({ where: { id: siloId } });
  if (!silo) return { error: 'Silo não encontrado.' };

  const reviews = await prisma.review.findMany({ where: { id: { in: reviewIds } } });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  const prompt = `Monte um roundup ("Os X Melhores...") a partir destes reviews já existentes:

${reviews
  .map((r) => `- id: ${r.id} | produto: "${r.productName}" | nota: ${r.rating} | resumo: ${r.summary}`)
  .join('\n')}

Tema do silo (categoria): "${silo.name}"

Gere:
- title: título chamativo para o roundup, no formato "Os ${reviews.length} Melhores [categoria]"
- snippet: meta description curta (1-2 frases) para o Google
- introContent: texto de introdução sobre a categoria de produto, 2 a 4 parágrafos separados por uma linha em branco
- order: lista dos ids dos reviews (campo "id" acima) na ordem de ranking sugerida, do melhor para o "também vale a pena"

Responda em JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          snippet: { type: Type.STRING },
          introContent: { type: Type.STRING },
          order: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['title', 'snippet', 'introContent', 'order'],
      },
    },
  });

  const text = response.text;
  if (!text) return { error: 'A IA não retornou uma resposta.' };

  let parsed: { title: string; snippet: string; introContent: string; order: string[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'Não foi possível interpretar a resposta da IA.' };
  }

  const validIds = new Set(reviews.map((r) => r.id));
  const orderedIds = parsed.order.filter((id) => validIds.has(id));
  for (const id of reviewIds) {
    if (!orderedIds.includes(id)) orderedIds.push(id);
  }

  const baseSlug = slugify(parsed.title);
  let slug = baseSlug;
  let counter = 2;
  while (await prisma.roundup.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const roundup = await prisma.roundup.create({
    data: {
      slug,
      title: parsed.title,
      snippet: parsed.snippet,
      introContent: parsed.introContent,
      status: 'DRAFT',
      authorId,
      items: {
        create: orderedIds.map((reviewId, index) => ({ reviewId, position: index })),
      },
    },
  });

  revalidatePath('/admin/roundups');
  redirect(`/admin/roundups/${roundup.id}`);
}
