import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    include: { _count: { select: { posts: true, reviews: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Autores</h1>
        <Link
          href="/admin/authors/new"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Novo Autor
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Posts</th>
              <th className="px-4 py-3">Reviews</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/authors/${author.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {author.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">{author.slug}</td>
                <td className="px-4 py-3 text-gray-600">{author._count.posts}</td>
                <td className="px-4 py-3 text-gray-600">{author._count.reviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {authors.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500">Nenhum autor encontrado.</p>
        )}
      </div>
    </div>
  );
}
