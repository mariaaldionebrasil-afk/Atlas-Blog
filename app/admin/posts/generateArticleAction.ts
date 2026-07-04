'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI, Type } from '@google/genai';
import { generateImage } from '@/lib/generateImage';
import { slugify } from '@/lib/slugify';

export async function generateFullArticle(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autenticado.' };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: 'Post não encontrado.' };

  const outline = post.outline as { level: 'H2' | 'H3'; text: string }[] | null;
  if (!outline || outline.length === 0) {
    return { error: 'Este post ainda não tem um outline aprovado.' };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  const prompt = `Escreva o conteúdo completo de um artigo de blog sobre "${post.title}", seguindo rigorosamente este outline:

${outline.map((t) => `${t.level}: ${t.text}`).join('\n')}

Regras:
- Para CADA item do outline, insira primeiro um bloco do tipo "heading" com o "level" (H2 ou H3) e o "text" exatamente como no outline, e só depois os blocos "paragraph" com o conteúdo daquela seção.
- Escreva em português do Brasil, tom acessível e informativo, cobrindo todos os tópicos do outline.
- Cada bloco "paragraph" deve ter 2 a 5 frases.
- Em 1 a 3 pontos do artigo onde uma imagem ilustrativa faria sentido, insira um bloco do tipo "image" no lugar apropriado, com um prompt descritivo em inglês (para gerar a imagem) e um alt text em português.
- Gere também um "title" (título chamativo e otimizado para SEO, diferente do termo de busca cru) e um "excerpt" (resumo curto, 1-2 frases, para meta description).

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
          excerpt: { type: Type.STRING },
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['heading', 'paragraph', 'image'] },
                level: { type: Type.STRING, enum: ['H2', 'H3'], nullable: true },
                text: { type: Type.STRING, nullable: true },
                prompt: { type: Type.STRING, nullable: true },
                alt: { type: Type.STRING, nullable: true },
              },
              required: ['type'],
            },
          },
        },
        required: ['title', 'excerpt', 'blocks'],
      },
    },
  });

  const text = response.text;
  if (!text) return { error: 'A IA não retornou uma resposta.' };

  let parsed: {
    title: string;
    excerpt: string;
    blocks: {
      type: 'heading' | 'paragraph' | 'image';
      level?: 'H2' | 'H3';
      text?: string;
      prompt?: string;
      alt?: string;
    }[];
  };
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'Não foi possível interpretar a resposta da IA.' };
  }

  const contentParts: string[] = [];
  let firstImageUrl: string | null = null;
  let imagesGenerated = 0;

  for (const block of parsed.blocks) {
    if (block.type === 'heading' && block.text) {
      const prefix = block.level === 'H3' ? '###' : '##';
      contentParts.push(`${prefix} ${block.text}`);
    } else if (block.type === 'paragraph' && block.text) {
      contentParts.push(block.text);
    } else if (block.type === 'image' && block.prompt) {
      try {
        const url = await generateImage(supabase, block.prompt, `article-${postId}`);
        contentParts.push(`![${block.alt ?? ''}](${url})`);
        imagesGenerated++;
        if (!firstImageUrl) firstImageUrl = url;
      } catch {
        // se a geração de imagem falhar, o artigo continua sem esse bloco
      }
    }
  }

  if (contentParts.length === 0) {
    return { error: 'A IA não gerou nenhum conteúdo de texto.' };
  }

  const baseSlug = slugify(parsed.title);
  let slug = baseSlug;
  let counter = 2;
  while (await prisma.post.findFirst({ where: { slug, id: { not: postId } } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: parsed.title,
      slug,
      content: contentParts.join('\n\n'),
      excerpt: parsed.excerpt,
      coverImage: post.coverImage || firstImageUrl,
      status: 'DRAFT',
    },
  });

  revalidatePath('/admin/posts');
  revalidatePath(`/admin/posts/${postId}`);
  return { success: true, imagesGenerated };
}
