import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CategoryForm } from '../CategoryForm';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminCategoryEditPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === 'new';

  const category = isNew ? null : await prisma.category.findUnique({ where: { id } });

  if (!isNew && !category) notFound();

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        {isNew ? 'Nova Categoria' : 'Editar Categoria'}
      </h1>
      <CategoryForm
        category={
          category
            ? {
                id: category.id,
                slug: category.slug,
                name: category.name,
                description: category.description ?? '',
              }
            : null
        }
      />
    </div>
  );
}
