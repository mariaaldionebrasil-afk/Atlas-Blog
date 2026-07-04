'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ContentStatus } from '@/lib/generated/prisma/enums';

export type PostInput = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  authorId: string;
  status: ContentStatus;
  keywordId?: string | null;
  outline?: { level: 'H2' | 'H3'; text: string }[] | null;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado.');
}

export async function savePost(input: PostInput) {
  await requireAdmin();

  const data = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    coverImage: input.coverImage || null,
    categoryId: input.categoryId,
    authorId: input.authorId,
    status: input.status,
  };

  if (input.id) {
    await prisma.post.update({ where: { id: input.id }, data });
  } else {
    await prisma.post.create({ data: { ...data, publishedDate: new Date() } });
  }

  revalidatePath('/admin/posts');
  revalidatePath('/blog');
  revalidatePath('/');
  redirect('/admin/posts');
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath('/admin/posts');
  revalidatePath('/blog');
  revalidatePath('/');
}
