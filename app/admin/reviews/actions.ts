'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ContentStatus } from '@/lib/generated/prisma/enums';

export type ReviewInput = {
  id?: string;
  slug: string;
  productName: string;
  rating: number;
  summary: string;
  content: string;
  pros: string[];
  cons: string[];
  coverImage: string;
  authorId: string;
  status: ContentStatus;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function saveReview(input: ReviewInput) {
  await requireAdmin();

  const data = {
    slug: input.slug,
    productName: input.productName,
    rating: input.rating,
    summary: input.summary,
    content: input.content,
    pros: input.pros,
    cons: input.cons,
    coverImage: input.coverImage || null,
    authorId: input.authorId,
    status: input.status,
  };

  if (input.id) {
    await prisma.review.update({ where: { id: input.id }, data });
  } else {
    await prisma.review.create({ data });
  }

  revalidatePath('/admin/reviews');
  revalidatePath('/reviews');
  revalidatePath('/');
  redirect('/admin/reviews');
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath('/admin/reviews');
  revalidatePath('/reviews');
  revalidatePath('/');
}
