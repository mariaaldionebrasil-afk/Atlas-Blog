'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function saveRoundup(input: {
  id: string;
  title: string;
  slug: string;
  snippet: string;
  introContent: string;
  itemIdsInOrder: string[];
}) {
  await requireAdmin();

  const slugTaken = await prisma.roundup.findFirst({
    where: { slug: input.slug, id: { not: input.id } },
  });
  if (slugTaken) {
    return { error: 'Já existe um roundup com esse slug.' };
  }

  await prisma.roundup.update({
    where: { id: input.id },
    data: {
      title: input.title,
      slug: input.slug,
      snippet: input.snippet,
      introContent: input.introContent,
    },
  });

  await Promise.all(
    input.itemIdsInOrder.map((itemId, index) =>
      prisma.roundupItem.update({ where: { id: itemId }, data: { position: index } })
    )
  );

  revalidatePath('/admin/roundups');
  revalidatePath(`/admin/roundups/${input.id}`);
  return { success: true };
}

export async function scheduleRoundup(id: string, scheduledDate: string) {
  await requireAdmin();

  const date = new Date(scheduledDate);
  if (Number.isNaN(date.getTime())) return { error: 'Data inválida.' };
  if (date.getTime() <= Date.now()) return { error: 'A data de agendamento deve ser no futuro.' };

  await prisma.roundup.update({
    where: { id },
    data: { status: 'SCHEDULED', scheduledDate: date },
  });

  revalidatePath('/admin/roundups');
  revalidatePath(`/admin/roundups/${id}`);
  return { success: true };
}

export async function deleteRoundup(id: string) {
  await requireAdmin();
  await prisma.roundupItem.deleteMany({ where: { roundupId: id } });
  await prisma.roundup.delete({ where: { id } });
  revalidatePath('/admin/roundups');
  redirect('/admin/roundups');
}
