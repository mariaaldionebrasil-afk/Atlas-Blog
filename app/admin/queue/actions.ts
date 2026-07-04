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

export async function approveForSchedule(postId: string, scheduledDate: string) {
  await requireAdmin();

  const date = new Date(scheduledDate);
  if (Number.isNaN(date.getTime())) {
    return { error: 'Data inválida.' };
  }
  if (date.getTime() <= Date.now()) {
    return { error: 'A data de agendamento deve ser no futuro.' };
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: 'SCHEDULED', scheduledDate: date },
  });

  revalidatePath('/admin/queue');
  revalidatePath('/admin/posts');
  return { success: true };
}
