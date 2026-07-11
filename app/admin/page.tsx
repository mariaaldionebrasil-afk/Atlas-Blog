import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [postCount, reviewCount, draftPostCount, draftReviewCount] = await Promise.all([
    prisma.post.count(),
    prisma.review.count(),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.review.count({ where: { status: "DRAFT" } }),
  ]);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Posts" value={postCount} />
        <StatCard label="Reviews" value={reviewCount} />
        <StatCard label="Rascunhos pendentes" value={draftPostCount + draftReviewCount} />
      </div>
    </div>
  );
}
