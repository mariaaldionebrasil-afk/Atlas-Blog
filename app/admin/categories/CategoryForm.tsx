'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import { saveCategory, deleteCategory, type CategoryInput } from './actions';

type Props = {
  category: CategoryInput | null;
};

export function CategoryForm({ category }: Props) {
  const router = useRouter();
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));
  const [description, setDescription] = useState(category?.description ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(newName: string) {
    setName(newName);
    if (!slugTouched) {
      setSlug(slugify(newName));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      await saveCategory({ id: category?.id, name, slug, description });
    } catch (e) {
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
        setError(e.message);
        setPending(false);
      }
      throw e;
    }
  }

  async function handleDelete() {
    if (!category?.id) return;
    if (!confirm('Excluir esta categoria definitivamente?')) return;
    try {
      await deleteCategory(category.id);
      router.push('/admin/categories');
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível excluir esta categoria.'
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
        {category?.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Excluir
          </button>
        )}
      </div>
    </form>
  );
}
