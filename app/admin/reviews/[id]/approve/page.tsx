import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ApprovalPanel, type SourceUrl } from './ApprovalPanel';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReviewApprovePage({ params }: Props) {
  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Revisar Review</h1>
      <ApprovalPanel
        reviewId={review.id}
        productName={review.productName}
        content={review.content}
        sourceUrls={(review.sourceUrls as unknown as SourceUrl[] | null) ?? []}
      />
    </div>
  );
}
