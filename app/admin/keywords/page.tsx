import { prisma } from '@/lib/prisma';
import { KeywordsPanel } from './KeywordsPanel';

export default async function AdminKeywordsPage() {
  const keywords = await prisma.keyword.findMany({
    include: { silo: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Keywords</h1>
      <KeywordsPanel keywords={keywords} />
    </div>
  );
}
