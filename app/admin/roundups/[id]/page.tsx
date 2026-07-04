import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RoundupForm, type RoundupItemView } from './RoundupForm';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminRoundupEditPage({ params }: Props) {
  const { id } = await params;

  const roundup = await prisma.roundup.findUnique({
    where: { id },
    include: {
      items: {
        include: { review: { select: { id: true, productName: true, rating: true, slug: true } } },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!roundup) notFound();

  const items: RoundupItemView[] = roundup.items.map((item) => ({
    id: item.id,
    reviewId: item.review.id,
    productName: item.review.productName,
    rating: item.review.rating,
    reviewSlug: item.review.slug,
  }));

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Editar Roundup</h1>
      <RoundupForm
        roundupId={roundup.id}
        status={roundup.status}
        title={roundup.title}
        slug={roundup.slug}
        snippet={roundup.snippet}
        introContent={roundup.introContent}
        items={items}
      />
    </div>
  );
}
