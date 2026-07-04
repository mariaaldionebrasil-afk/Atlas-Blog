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

export type OutlineTopic = {
  level: 'H2' | 'H3';
  text: string;
};

export async function generateOutline(keywordId: string): Promise<{ topics: OutlineTopic[] } | { error: string }> {
  await requireAdmin();

  const keyword = await prisma.keyword.findUnique({
    where: { id: keywordId },
    include: { silo: true },
  });

  if (!keyword) {
    return { error: 'Keyword não encontrada.' };
  }

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
  if (!text) {
    return { error: 'A IA não retornou uma resposta.' };
  }

  try {
    const parsed = JSON.parse(text) as { topics: OutlineTopic[] };
    return { topics: parsed.topics };
  } catch {
    return { error: 'Não foi possível interpretar a resposta da IA.' };
  }
}

export async function approveOutline(input: {
  keywordId: string;
  postId?: string;
  topics: OutlineTopic[];
  categoryId: string;
  authorId: string;
}) {
  await requireAdmin();

  const keyword = await prisma.keyword.findUnique({ where: { id: input.keywordId } });
  if (!keyword) throw new Error('Keyword não encontrada.');

  const baseSlug = slugify(keyword.term);

  if (input.postId) {
    await prisma.post.update({
      where: { id: input.postId },
      data: { outline: input.topics, categoryId: input.categoryId, authorId: input.authorId },
    });
  } else {
    await prisma.post.create({
      data: {
        slug: await uniqueSlug(baseSlug),
        title: keyword.term,
        excerpt: '',
        content: '',
        publishedDate: new Date(),
        status: 'DRAFT',
        categoryId: input.categoryId,
        authorId: input.authorId,
        keywordId: keyword.id,
        outline: input.topics,
      },
    });
  }

  revalidatePath('/admin/keywords');
  revalidatePath(`/admin/keywords/${input.keywordId}/outline`);
  redirect('/admin/keywords');
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 2;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}
