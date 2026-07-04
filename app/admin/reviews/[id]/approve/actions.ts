'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function approveReviewSchedule(reviewId: string, scheduledDate: string) {
  await requireAdmin();

  const date = new Date(scheduledDate);
  if (Number.isNaN(date.getTime())) {
    return { error: 'Data inválida.' };
  }
  if (date.getTime() <= Date.now()) {
    return { error: 'A data de agendamento deve ser no futuro.' };
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return { error: 'Review não encontrado.' };

  if (!review.affiliateLinkAmazon && !review.affiliateLinkMercadoLivre) {
    return {
      error: 'Preencha ao menos um link de afiliado (Amazon ou Mercado Livre) antes de aprovar. Use "Editar texto".',
    };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: 'SCHEDULED', scheduledDate: date },
  });

  revalidatePath('/admin/reviews');
  revalidatePath(`/admin/reviews/${reviewId}`);
  return { success: true };
}
