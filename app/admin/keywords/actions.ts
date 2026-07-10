'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { GoogleGenAI, Type } from '@google/genai';
import type { KeywordStatus } from '@/lib/generated/prisma/enums';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function importKeywords(raw: string) {
  await requireAdmin();

  const rows = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [term, searchIntent, volume, cpc] = line.split(',').map((s) => s.trim());
      return {
        term,
        searchIntent: searchIntent || null,
        volume: volume ? Number(volume) || null : null,
        cpc: cpc ? Number(cpc) || null : null,
      };
    })
    .filter((row) => row.term);

  if (rows.length === 0) {
    return { error: 'Nenhuma keyword válida encontrada. Use o formato: termo, intenção, volume, cpc' };
  }

  await prisma.keyword.createMany({ data: rows });
  revalidatePath('/admin/keywords');
  return { count: rows.length };
}

export async function checkCannibalization() {
  await requireAdmin();

  const keywords = await prisma.keyword.findMany({
    where: { status: { in: ['PENDENTE', 'CANIBALIZADA'] } },
  });

  if (keywords.length < 2) {
    return { error: 'É preciso ao menos 2 keywords pendentes para checar canibalização.' };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  const prompt = `Analise esta lista de keywords de SEO e identifique quais têm intenção de busca sobreposta (canibalização) — ou seja, keywords diferentes que competiriam pela mesma página/artigo no Google. Agrupe apenas as que realmente conflitam entre si. Ignore as que não têm conflito.

Ao avaliar se duas keywords competem entre si (canibalização), considere
que keywords de cauda longa com ângulos de busca DIFERENTES não são
canibalização, mesmo compartilhando o mesmo tema geral. Exemplos que
NÃO são canibalização: "X emagrece" vs "X para iniciantes" vs "quantas
calorias X queima" — são ângulos distintos que merecem artigos
separados. Só sinalize canibalização quando as duas keywords
claramente disputariam a MESMA página para satisfazer a MESMA
intenção de busca (ex: "melhor X" e "X mais vendido" são
essencialmente a mesma busca). Na dúvida, NÃO sinalize — prefira
falso-negativo a falso-positivo, já que descartar uma keyword válida
custa mais que manter uma competição leve.

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
          groups: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keywordIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                note: { type: Type.STRING },
              },
              required: ['keywordIds', 'note'],
            },
          },
        },
        required: ['groups'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    return { error: 'A IA não retornou uma resposta.' };
  }

  let parsed: { groups: { keywordIds: string[]; note: string }[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'Não foi possível interpretar a resposta da IA.' };
  }

  const validIds = new Set(keywords.map((k) => k.id));
  let flaggedCount = 0;

  for (const group of parsed.groups ?? []) {
    const ids = group.keywordIds.filter((id) => validIds.has(id));
    if (ids.length < 2) continue;
    await prisma.keyword.updateMany({
      where: { id: { in: ids } },
      data: { status: 'CANIBALIZADA', cannibalizationNote: group.note },
    });
    flaggedCount += ids.length;
  }

  revalidatePath('/admin/keywords');
  return { flaggedCount };
}

export async function updateKeywordStatus(id: string, status: KeywordStatus) {
  await requireAdmin();
  await prisma.keyword.update({
    where: { id },
    data: {
      status,
      ...(status === 'PENDENTE' ? { cannibalizationNote: null } : {}),
    },
  });
  revalidatePath('/admin/keywords');
}
