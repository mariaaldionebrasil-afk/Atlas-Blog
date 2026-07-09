import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { RoundupsPanel } from './RoundupsPanel';
import { SocialPublishBadge } from '@/components/SocialPublishBadge';

const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
};

export default async function AdminRoundupsPage() {
  const [pilares, authors, roundups] = await Promise.all([
    prisma.silo.findMany({ where: { type: 'PILAR' }, orderBy: { name: 'asc' } }),
    prisma.author.findMany({ orderBy: { name: 'asc' } }),
    prisma.roundup.findMany({
      include: {
        author: true,
        items: true,
        socialPublications: { where: { status: 'FAILED' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Roundups</h1>

      {pilares.length === 0 ? (
        <p className="mb-6 text-sm text-gray-500">
          Nenhum silo Pilar encontrado ainda. Aprove uma estrutura de silo em /admin/silos primeiro.
        </p>
      ) : (
        <div className="mb-8">
          <RoundupsPanel pilares={pilares} authors={authors} />
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Autor</th>
              <th className="px-4 py-3">Itens</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {roundups.map((roundup) => (
              <tr key={roundup.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/roundups/${roundup.id}`} className="font-medium text-gray-900 hover:underline">
                    {roundup.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{roundup.author.name}</td>
                <td className="px-4 py-3 text-gray-600">{roundup.items.length}</td>
                <td className="px-4 py-3 text-gray-600">
                  {statusLabel[roundup.status]}
                  <SocialPublishBadge failures={roundup.socialPublications} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roundups.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500">Nenhum roundup criado ainda.</p>
        )}
      </div>
    </div>
  );
}
