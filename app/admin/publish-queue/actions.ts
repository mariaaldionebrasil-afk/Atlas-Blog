'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { approveForSchedule } from '../queue/actions';
import { approveReviewSchedule } from '../reviews/[id]/approve/actions';
import { scheduleRoundup as scheduleRoundupExisting } from '../roundups/[id]/actions';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function scheduleReviewItem(reviewId: string, scheduledDate: string) {
  await requireAdmin();
  const result = await approveReviewSchedule(reviewId, scheduledDate);
  revalidatePath('/admin/publish-queue');
  return result;
}

export async function scheduleRoundupItem(roundupId: string, scheduledDate: string) {
  await requireAdmin();

  const roundup = await prisma.roundup.findUnique({
    where: { id: roundupId },
    include: {
      items: {
        include: {
          review: { select: { status: true, productName: true } },
          post: { select: { status: true, title: true } },
        },
      },
    },
  });
  if (!roundup) return { error: 'Artigo Silo não encontrado.' };

  const notReady = roundup.items
    .filter((i) => (i.review?.status ?? i.post!.status) === 'DRAFT')
    .map((i) => i.review?.productName ?? i.post!.title);
  if (notReady.length > 0) {
    return { error: `Agende primeiro os itens: ${notReady.join(', ')}.` };
  }

  const result = await scheduleRoundupExisting(roundupId, scheduledDate);
  revalidatePath('/admin/publish-queue');
  return result;
}

export async function schedulePostItem(postId: string, scheduledDate: string) {
  await requireAdmin();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      comparedReviewA: { select: { status: true, productName: true } },
      comparedReviewB: { select: { status: true, productName: true } },
      roundup: { select: { status: true, title: true } },
      roundupItems: { select: { roundupId: true } },
    },
  });
  if (!post) return { error: 'Post não encontrado.' };

  // Um Post INFORMACIONAL que é ele mesmo um satélite (RoundupItem) do seu Artigo Silo
  // é "upstream" (equivalente a Review) — é o Silo que espera por ele, não o contrário.
  const isUpstreamSatellite = post.roundupItems.some((ri) => ri.roundupId === post.roundupId);

  if (post.postType === 'COMPARACAO') {
    const missing = [post.comparedReviewA, post.comparedReviewB]
      .filter((r) => r && r.status === 'DRAFT')
      .map((r) => r!.productName);
    if (missing.length > 0) {
      return { error: `Agende primeiro os produtos comparados: ${missing.join(', ')}.` };
    }
  } else if ((post.postType === 'APOIO' || post.postType === 'INFORMACIONAL') && post.roundup && !isUpstreamSatellite) {
    if (post.roundup.status === 'DRAFT') {
      return { error: `Agende primeiro o Artigo Silo "${post.roundup.title}".` };
    }
  }

  const result = await approveForSchedule(postId, scheduledDate);
  revalidatePath('/admin/publish-queue');
  return result;
}
