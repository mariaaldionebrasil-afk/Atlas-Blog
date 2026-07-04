'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type AuthorInput = {
  id?: string;
  slug: string;
  name: string;
  bio: string;
  avatar: string;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function saveAuthor(input: AuthorInput) {
  await requireAdmin();

  const data = {
    slug: input.slug,
    name: input.name,
    bio: input.bio,
    avatar: input.avatar || null,
  };

  if (input.id) {
    await prisma.author.update({ where: { id: input.id }, data });
  } else {
    await prisma.author.create({ data });
  }

  revalidatePath('/admin/authors');
  revalidatePath('/admin/posts');
  revalidatePath('/admin/reviews');
  redirect('/admin/authors');
}

export async function deleteAuthor(id: string) {
  await requireAdmin();
  await prisma.author.delete({ where: { id } });
  revalidatePath('/admin/authors');
}
