import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ReviewGeneratePanel } from './ReviewGeneratePanel';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function KeywordReviewPage({ params }: Props) {
  const { id } = await params;

  const [keyword, existingReview, authors] = await Promise.all([
    prisma.keyword.findUnique({ where: { id } }),
    prisma.review.findFirst({ where: { keywordId: id } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!keyword) notFound();

  if (existingReview) {
    redirect(`/admin/reviews/${existingReview.id}/approve`);
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-xl font-semibold text-gray-900">Gerar Review: {keyword.term}</h1>
      <p className="mb-6 text-sm text-gray-500">
        Pesquisa e gera um review completo com fontes reais para esta keyword.
      </p>
      <ReviewGeneratePanel keywordId={keyword.id} authors={authors} />
    </div>
  );
}
