'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import { CoverImageField } from '../CoverImageField';
import { saveAuthor, deleteAuthor, type AuthorInput } from './actions';

type Props = {
  author: AuthorInput | null;
};

export function AuthorForm({ author }: Props) {
  const router = useRouter();
  const [name, setName] = useState(author?.name ?? '');
  const [slug, setSlug] = useState(author?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(author?.slug));
  const [bio, setBio] = useState(author?.bio ?? '');
  const [avatar, setAvatar] = useState(author?.avatar ?? '');
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
      await saveAuthor({ id: author?.id, name, slug, bio, avatar });
    } catch (e) {
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
        setError(e.message);
        setPending(false);
      }
      throw e;
    }
  }

  async function handleDelete() {
    if (!author?.id) return;
    if (!confirm('Excluir este autor definitivamente?')) return;
    try {
      await deleteAuthor(author.id);
      router.push('/admin/authors');
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Não foi possível excluir este autor.'
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
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          required
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <CoverImageField value={avatar} onChange={setAvatar} label="Avatar" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
        {author?.id && (
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
