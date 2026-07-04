import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AuthorForm } from '../AuthorForm';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminAuthorEditPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === 'new';

  const author = isNew ? null : await prisma.author.findUnique({ where: { id } });

  if (!isNew && !author) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        {isNew ? 'Novo Autor' : 'Editar Autor'}
      </h1>
      <AuthorForm
        author={
          author
            ? {
                id: author.id,
                slug: author.slug,
                name: author.name,
                bio: author.bio,
                avatar: author.avatar ?? '',
              }
            : null
        }
      />
    </div>
  );
}
