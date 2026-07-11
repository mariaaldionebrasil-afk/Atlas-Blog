import { prisma } from '@/lib/prisma';
import { CreationQueuePanel, type CreationItem, type ItemType } from './CreationQueuePanel';
import type { OutlineTopic } from './actions';

const TYPE_RANK: Record<ItemType, number> = {
  REVIEW: 0,
  ARTIGO_SILO: 1,
  APOIO: 2,
  INFORMACIONAL: 2,
  COMPARACAO: 2,
};

export default async function AdminCreationQueuePage() {
  const [pendingReviews, pendingRoundups, pendingPosts, categories, authors] = await Promise.all([
    prisma.review.findMany({
      where: { content: '' },
      include: { keyword: { include: { silo: true } } },
    }),
    prisma.roundup.findMany({
      where: { introContent: '' },
      include: { keyword: { include: { silo: true } }, items: { orderBy: { position: 'asc' } } },
    }),
    prisma.post.findMany({
      where: { content: '', postType: { not: null } },
      include: { keyword: { include: { silo: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const items: CreationItem[] = [
    ...pendingReviews.map((r): CreationItem => ({
      kind: 'REVIEW',
      id: r.id,
      title: r.productName,
      siloId: r.keyword?.siloId ?? null,
      siloName: r.keyword?.silo?.name ?? 'Sem silo',
      outline: (r.outline as unknown as OutlineTopic[] | null) ?? [],
      categoryId: r.categoryId,
      authorId: r.authorId,
      coverImage: r.coverImage,
      affiliateLinkAmazon: r.affiliateLinkAmazon,
      affiliateLinkMercadoLivre: r.affiliateLinkMercadoLivre,
      comparedReviewIdA: null,
      comparedReviewIdB: null,
      reviewIds: [],
    })),
    ...pendingRoundups.map((r): CreationItem => ({
      kind: 'ARTIGO_SILO',
      id: r.id,
      title: r.title,
      siloId: r.keyword?.siloId ?? null,
      siloName: r.keyword?.silo?.name ?? 'Sem silo',
      outline: (r.outline as unknown as OutlineTopic[] | null) ?? [],
      categoryId: r.categoryId,
      authorId: r.authorId,
      coverImage: null,
      affiliateLinkAmazon: null,
      affiliateLinkMercadoLivre: null,
      comparedReviewIdA: null,
      comparedReviewIdB: null,
      reviewIds: r.items.map((i) => i.reviewId),
    })),
    ...pendingPosts.map((p): CreationItem => ({
      kind: p.postType as ItemType,
      id: p.id,
      title: p.title,
      siloId: p.keyword?.siloId ?? null,
      siloName: p.keyword?.silo?.name ?? 'Sem silo',
      outline: (p.outline as unknown as OutlineTopic[] | null) ?? [],
      categoryId: p.categoryId,
      authorId: p.authorId,
      coverImage: p.coverImage,
      affiliateLinkAmazon: p.affiliateLinkAmazon,
      affiliateLinkMercadoLivre: p.affiliateLinkMercadoLivre,
      comparedReviewIdA: p.comparedReviewIdA,
      comparedReviewIdB: p.comparedReviewIdB,
      reviewIds: [],
    })),
  ].sort((a, b) => {
    if (a.siloName !== b.siloName) return a.siloName.localeCompare(b.siloName);
    return TYPE_RANK[a.kind] - TYPE_RANK[b.kind];
  });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Fila de Criação</h1>
      <CreationQueuePanel items={items} categories={categories} authors={authors} />
    </div>
  );
}
