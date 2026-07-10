'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/slugify';
import {
  generateSiloStructure,
  type StructureItem,
  type StructureItemType,
  type StructureProposal,
} from '@/lib/generateSiloStructure';

export type { StructureItem, StructureItemType, StructureProposal } from '@/lib/generateSiloStructure';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function runGenerateStructure(
  seedKeyword: string
): Promise<StructureProposal | { error: string }> {
  await requireAdmin();

  if (!seedKeyword.trim()) {
    return { error: 'Informe uma keyword semente.' };
  }

  try {
    return await generateSiloStructure(seedKeyword.trim());
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erro ao gerar a estrutura.' };
  }
}

async function uniqueSlug(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], title: string) {
  const base = slugify(title);
  let slug = base;
  let counter = 2;
  while (
    (await tx.post.findUnique({ where: { slug } })) ||
    (await tx.review.findUnique({ where: { slug } })) ||
    (await tx.roundup.findUnique({ where: { slug } }))
  ) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

export async function approveStructure(proposal: StructureProposal): Promise<void> {
  await requireAdmin();

  const artigoSilo = proposal.items.find((item) => item.type === 'ARTIGO_SILO');
  if (!artigoSilo) {
    throw new Error('A estrutura precisa de exatamente 1 item do tipo Artigo Silo antes de aprovar.');
  }

  await prisma.$transaction(async (tx) => {
    const silo = await tx.silo.create({
      data: { name: proposal.silo.name, type: 'PILAR' },
    });

    const keywordIdByItemKeyword = new Map<string, string>();
    for (const item of proposal.items) {
      const keyword = await tx.keyword.create({
        data: { term: item.keyword, status: 'APROVADA', siloId: silo.id },
      });
      keywordIdByItemKeyword.set(item.keyword, keyword.id);
    }

    const reviewIdByItemKeyword = new Map<string, string>();
    for (const item of proposal.items.filter((i) => i.type === 'SINGLE_PRODUCT_REVIEW')) {
      const slug = await uniqueSlug(tx, item.title);
      const review = await tx.review.create({
        data: {
          slug,
          productName: item.title,
          summary: '',
          content: '',
          pros: [],
          cons: [],
          keywordId: keywordIdByItemKeyword.get(item.keyword),
          searchIntentFormat: item.searchIntentFormat,
          status: 'DRAFT',
        },
      });
      reviewIdByItemKeyword.set(item.keyword, review.id);
    }

    const artigoSiloSlug = await uniqueSlug(tx, artigoSilo.title);
    const roundup = await tx.roundup.create({
      data: {
        slug: artigoSiloSlug,
        title: artigoSilo.title,
        snippet: '',
        introContent: '',
        keywordId: keywordIdByItemKeyword.get(artigoSilo.keyword),
        searchIntentFormat: artigoSilo.searchIntentFormat,
        status: 'DRAFT',
      },
    });

    for (const item of proposal.items.filter(
      (i): i is StructureItem & { type: 'APOIO' | 'INFORMACIONAL' | 'COMPARACAO' } =>
        i.type === 'APOIO' || i.type === 'INFORMACIONAL' || i.type === 'COMPARACAO'
    )) {
      const slug = await uniqueSlug(tx, item.title);
      const comparedReviewIdA =
        item.type === 'COMPARACAO' && item.comparedProducts
          ? reviewIdByItemKeyword.get(item.comparedProducts[0])
          : undefined;
      const comparedReviewIdB =
        item.type === 'COMPARACAO' && item.comparedProducts
          ? reviewIdByItemKeyword.get(item.comparedProducts[1])
          : undefined;

      await tx.post.create({
        data: {
          slug,
          title: item.title,
          excerpt: '',
          content: '',
          postType: item.type,
          keywordId: keywordIdByItemKeyword.get(item.keyword),
          roundupId: roundup.id,
          searchIntentFormat: item.searchIntentFormat,
          comparedReviewIdA,
          comparedReviewIdB,
          status: 'DRAFT',
        },
      });
    }
  }, { timeout: 30000 });

  revalidatePath('/admin/generate-structure');
}
