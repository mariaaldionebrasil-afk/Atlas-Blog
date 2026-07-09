import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SocialPublishBadge } from '@/components/SocialPublishBadge';

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
};

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter = status === 'DRAFT' || status === 'PUBLISHED' ? status : undefined;

  const reviews = await prisma.review.findMany({
    where: filter ? { status: filter } : undefined,
    include: {
      author: true,
      socialPublications: { where: { status: 'FAILED' } },
    },
  });

  const filters = [
    { label: 'Todos', value: undefined },
    { label: 'Rascunho', value: 'DRAFT' },
    { label: 'Publicado', value: 'PUBLISHED' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Reviews</h1>
        <Link
          href="/admin/reviews/new"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Novo Review
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/reviews?status=${f.value}` : '/admin/reviews'}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === f.value
                ? 'bg-gray-900 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3">Autor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/reviews/${review.id}`} className="font-medium text-gray-900 hover:underline">
                    {review.productName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{review.rating}/5</td>
                <td className="px-4 py-3 text-gray-600">{review.author.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      review.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {statusLabel[review.status]}
                  </span>
                  <SocialPublishBadge failures={review.socialPublications} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500">Nenhum review encontrado.</p>
        )}
      </div>
    </div>
  );
}
