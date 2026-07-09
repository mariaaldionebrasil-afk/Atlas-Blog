import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SocialPublishBadge } from '@/components/SocialPublishBadge';

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
};

const statusColor: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
};

export default async function AdminPostsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const filter =
    status === 'DRAFT' || status === 'SCHEDULED' || status === 'PUBLISHED' ? status : undefined;

  const posts = await prisma.post.findMany({
    where: filter ? { status: filter } : undefined,
    include: {
      category: true,
      author: true,
      socialPublications: { where: { status: 'FAILED' } },
    },
    orderBy: { publishedDate: 'desc' },
  });

  const filters = [
    { label: 'Todos', value: undefined },
    { label: 'Rascunho', value: 'DRAFT' },
    { label: 'Agendado', value: 'SCHEDULED' },
    { label: 'Publicado', value: 'PUBLISHED' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Novo Post
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/admin/posts?status=${f.value}` : '/admin/posts'}
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
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Autor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/posts/${post.id}`} className="font-medium text-gray-900 hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{post.category.name}</td>
                <td className="px-4 py-3 text-gray-600">{post.author.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[post.status]}`}>
                    {statusLabel[post.status]}
                  </span>
                  <SocialPublishBadge failures={post.socialPublications} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500">Nenhum post encontrado.</p>
        )}
      </div>
    </div>
  );
}
