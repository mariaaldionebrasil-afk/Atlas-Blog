import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PostForm } from '../PostForm';
import { GenerateArticleButton } from './GenerateArticleButton';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminPostEditPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === 'new';

  const [post, categories, authors] = await Promise.all([
    isNew ? null : prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!isNew && !post) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        {isNew ? 'Novo Post' : 'Editar Post'}
      </h1>
      {post?.outline && (post.outline as unknown[]).length > 0 && (
        <GenerateArticleButton postId={post.id} />
      )}
      <PostForm
        key={post ? `${post.id}:${post.content.length}` : 'new'}
        post={
          post
            ? {
                id: post.id,
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage ?? '',
                categoryId: post.categoryId ?? categories[0]?.id ?? '',
                authorId: post.authorId ?? authors[0]?.id ?? '',
                status: post.status,
                keywordId: post.keywordId,
                outline: (post.outline as unknown as { level: 'H2' | 'H3'; text: string }[] | null) ?? null,
              }
            : null
        }
        categories={categories}
        authors={authors}
      />
    </div>
  );
}
