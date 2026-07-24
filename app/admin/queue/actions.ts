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

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, categoryId: true },
  });
  if (!post) return { error: 'Post não encontrado.' };

  const missing = [!post.authorId && 'autor', !post.categoryId && 'categoria'].filter(
    (v): v is string => Boolean(v)
  );
  if (missing.length > 0) {
    return { error: `Preencha ${missing.join(' e ')} antes de agendar este post.` };
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: 'SCHEDULED', scheduledDate: date },
  });

  revalidatePath('/admin/queue');
  revalidatePath('/admin/posts');
  return { success: true };
}
