import { prisma } from '@/lib/prisma';
import { PublishQueuePanel, type PublishItem, type PublishItemType } from './PublishQueuePanel';

const TYPE_RANK: Record<PublishItemType, number> = {
  REVIEW: 0,
  ARTIGO_SILO: 1,
  APOIO: 2,
  INFORMACIONAL: 2,
  COMPARACAO: 2,
};

export default async function AdminPublishQueuePage() {
  const [readyReviews, readyRoundups, readyPosts] = await Promise.all([
    prisma.review.findMany({
      where: { status: 'DRAFT', content: { not: '' } },
      include: { category: true, author: true, keyword: { include: { silo: true } } },
    }),
    prisma.roundup.findMany({
      where: { status: 'DRAFT', introContent: { not: '' } },
      include: {
        category: true,
        author: true,
        keyword: { include: { silo: true } },
        items: { include: { review: { select: { status: true, productName: true } } }, orderBy: { position: 'asc' } },
      },
    }),
    prisma.post.findMany({
      where: { status: 'DRAFT', content: { not: '' }, postType: { not: null } },
      include: {
        category: true,
        author: true,
        keyword: { include: { silo: true } },
        comparedReviewA: { select: { status: true, productName: true } },
        comparedReviewB: { select: { status: true, productName: true } },
        roundup: { select: { status: true, title: true } },
      },
    }),
  ]);

  const items: PublishItem[] = [
    ...readyReviews.map(
      (r): PublishItem => ({
        kind: 'REVIEW',
        id: r.id,
        title: r.productName,
        siloName: r.keyword?.silo?.name ?? 'Sem silo',
        categoryName: r.category?.name ?? '—',
        authorName: r.author?.name ?? '—',
        dependencies: [],
      })
    ),
    ...readyRoundups.map(
      (r): PublishItem => ({
        kind: 'ARTIGO_SILO',
        id: r.id,
        title: r.title,
        siloName: r.keyword?.silo?.name ?? 'Sem silo',
        categoryName: r.category?.name ?? '—',
        authorName: r.author?.name ?? '—',
        dependencies: r.items.map((i) => ({ label: i.review.productName, ready: i.review.status !== 'DRAFT' })),
      })
    ),
    ...readyPosts.map((p): PublishItem => {
      const dependencies =
        p.postType === 'COMPARACAO'
          ? [p.comparedReviewA, p.comparedReviewB]
              .filter((r) => r !== null)
              .map((r) => ({ label: r.productName, ready: r.status !== 'DRAFT' }))
          : p.roundup
            ? [{ label: p.roundup.title, ready: p.roundup.status !== 'DRAFT' }]
            : [];

      return {
        kind: p.postType as PublishItemType,
        id: p.id,
        title: p.title,
        siloName: p.keyword?.silo?.name ?? 'Sem silo',
        categoryName: p.category?.name ?? '—',
        authorName: p.author?.name ?? '—',
        dependencies,
      };
    }),
  ].sort((a, b) => {
    if (a.siloName !== b.siloName) return a.siloName.localeCompare(b.siloName);
    return TYPE_RANK[a.kind] - TYPE_RANK[b.kind];
  });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Fila de Publicação</h1>
      <PublishQueuePanel items={items} />
    </div>
  );
}
