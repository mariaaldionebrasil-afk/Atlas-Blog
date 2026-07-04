'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type CategoryInput = {
  id?: string;
  slug: string;
  name: string;
  description: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function saveCategory(input: CategoryInput) {
  await requireAdmin();

  const data = {
    slug: input.slug,
    name: input.name,
    description: input.description || null,
  };

  if (input.id) {
    await prisma.category.update({ where: { id: input.id }, data });
  } else {
    await prisma.category.create({ data });
  }

  revalidatePath('/admin/categories');
  revalidatePath('/admin/posts');
  redirect('/admin/categories');
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
}
