import { prisma } from '@/lib/prisma';
import { QueuePanel, type QueuedPost } from './QueuePanel';

export const dynamic = 'force-dynamic';

export default async function AdminQueuePage() {
  const draftPosts = await prisma.post.findMany({
    where: { status: 'DRAFT' },
    include: { category: true, author: true },
    orderBy: { publishedDate: 'desc' },
  });

  const readyPosts: QueuedPost[] = draftPosts
    .filter((p) => p.outline && p.content.trim().length > 0)
    .map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category?.name ?? '—',
      author: p.author?.name ?? '—',
    }));

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Fila de Revisão</h1>
      <QueuePanel posts={readyPosts} />
    </div>
  );
}
