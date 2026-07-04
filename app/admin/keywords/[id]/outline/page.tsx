import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { OutlinePanel } from './OutlinePanel';
import type { OutlineTopic } from './actions';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function KeywordOutlinePage({ params }: Props) {
  const { id } = await params;

  const [keyword, existingPost, categories, authors] = await Promise.all([
    prisma.keyword.findUnique({ where: { id }, include: { silo: true } }),
    prisma.post.findFirst({ where: { keywordId: id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!keyword) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Tópicos: {keyword.term}</h1>
      {keyword.silo && <p className="mb-6 text-sm text-gray-500">Silo: {keyword.silo.name}</p>}
      <OutlinePanel
        keywordId={keyword.id}
        existingPost={
          existingPost
            ? {
                id: existingPost.id,
                categoryId: existingPost.categoryId,
                authorId: existingPost.authorId,
                outline: (existingPost.outline as unknown as OutlineTopic[] | null) ?? [],
              }
            : null
        }
        categories={categories}
        authors={authors}
      />
    </div>
  );
}
