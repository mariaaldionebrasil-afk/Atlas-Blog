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

export type ProposedSilo = {
  tempId: string;
  name: string;
  type: 'PILAR' | 'APOIO' | 'SATELITE';
  parentTempId: string | null;
};

export type SiloProposal = {
  silos: ProposedSilo[];
  keywords: { id: string; term: string }[];
  assignments: Record<string, string | null>;
};

export async function generateSiloStructure(): Promise<SiloProposal | { error: string }> {
  await requireAdmin();

  const keywords = await prisma.keyword.findMany({ where: { status: 'APROVADA' } });

  if (keywords.length < 2) {
    return { error: 'É preciso ao menos 2 keywords aprovadas para gerar uma estrutura de silo.' };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  const prompt = `Você é um especialista em arquitetura de conteúdo SEO (silo). Organize as keywords abaixo em uma estrutura de silo com 3 níveis:
- Exatamente 1 Pilar (Cabeça): o artigo central, mais abrangente, com parentTempId nulo
- N Apoio (Cluster): subtemas que sustentam o pilar, com parentTempId apontando para o tempId do Pilar
- N Satélite (Cauda longa): tópicos bem específicos, cada um com parentTempId apontando para o tempId de um Apoio

Cada keyword deve ser atribuída a exatamente um silo (pelo campo keywordIds). Invente um tempId curto (ex: "s1", "s2") para cada silo.

Keywords:
${keywords
  .map((k) => `- id: ${k.id} | termo: "${k.term}" | intenção: ${k.searchIntent ?? 'não informada'} | volume: ${k.volume ?? '?'}`)
  .join('\n')}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          silos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tempId: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['PILAR', 'APOIO', 'SATELITE'] },
                parentTempId: { type: Type.STRING, nullable: true },
                keywordIds: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['tempId', 'name', 'type', 'keywordIds'],
            },
          },
        },
        required: ['silos'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    return { error: 'A IA não retornou uma resposta.' };
  }

  let parsed: {
    silos: Array<{
      tempId: string;
      name: string;
      type: string;
      parentTempId?: string | null;
      keywordIds: string[];
    }>;
  };

  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'Não foi possível interpretar a resposta da IA.' };
  }

  const validIds = new Set(keywords.map((k) => k.id));

  const silos: ProposedSilo[] = parsed.silos.map((s) => ({
    tempId: s.tempId,
    name: s.name,
    type: s.type as 'PILAR' | 'APOIO' | 'SATELITE',
    parentTempId: s.parentTempId ?? null,
  }));

  const assignments: Record<string, string | null> = {};
  for (const kw of keywords) assignments[kw.id] = null;
  for (const s of parsed.silos) {
    for (const kid of s.keywordIds) {
      if (validIds.has(kid)) assignments[kid] = s.tempId;
    }
  }

  return {
    silos,
    keywords: keywords.map((k) => ({ id: k.id, term: k.term })),
    assignments,
  };
}

export async function saveSiloStructure(input: {
  silos: ProposedSilo[];
  assignments: Record<string, string | null>;
}) {
  await requireAdmin();

  const tempIdToRealId = new Map<string, string>();
  const remaining = [...input.silos];
  let safety = 0;

  while (remaining.length > 0 && safety < 50) {
    safety++;
    for (let i = remaining.length - 1; i >= 0; i--) {
      const s = remaining[i];
      const parentRealId = s.parentTempId ? tempIdToRealId.get(s.parentTempId) : undefined;
      if (s.parentTempId && !parentRealId) continue;

      const created = await prisma.silo.create({
        data: {
          name: s.name,
          type: s.type,
          parentId: parentRealId ?? null,
        },
      });
      tempIdToRealId.set(s.tempId, created.id);
      remaining.splice(i, 1);
    }
  }

  for (const [keywordId, tempId] of Object.entries(input.assignments)) {
    const realId = tempId ? tempIdToRealId.get(tempId) ?? null : null;
    await prisma.keyword.update({
      where: { id: keywordId },
      data: { siloId: realId },
    });
  }

  revalidatePath('/admin/silos');
  revalidatePath('/admin/keywords');
  return { success: true };
}
