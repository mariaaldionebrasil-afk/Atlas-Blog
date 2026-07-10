import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ReviewForm } from '../ReviewForm';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminReviewEditPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === 'new';

  const [review, authors] = await Promise.all([
    isNew ? null : prisma.review.findUnique({ where: { id } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!isNew && !review) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        {isNew ? 'Novo Review' : 'Editar Review'}
      </h1>
      <ReviewForm
        review={
          review
            ? {
                id: review.id,
                slug: review.slug,
                productName: review.productName,
                rating: review.rating ?? 0,
                summary: review.summary,
                content: review.content,
                pros: review.pros,
                cons: review.cons,
                coverImage: review.coverImage ?? '',
                price: review.price ?? '',
                authorId: review.authorId ?? authors[0]?.id ?? '',
                status: review.status,
                affiliateLinkAmazon: review.affiliateLinkAmazon ?? '',
                affiliateLinkMercadoLivre: review.affiliateLinkMercadoLivre ?? '',
              }
            : null
        }
        authors={authors}
      />
    </div>
  );
}
