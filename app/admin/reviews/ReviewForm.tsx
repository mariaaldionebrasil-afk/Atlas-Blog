'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import { CoverImageField } from '../CoverImageField';
import { saveReview, deleteReview, type ReviewInput } from './actions';
import type { ContentStatus } from '@/lib/generated/prisma/enums';

type Option = { id: string; name: string };

type Props = {
  review: ReviewInput | null;
  authors: Option[];
};

export function ReviewForm({ review, authors }: Props) {
  const router = useRouter();
  const [productName, setProductName] = useState(review?.productName ?? '');
  const [slug, setSlug] = useState(review?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(review?.slug));
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [summary, setSummary] = useState(review?.summary ?? '');
  const [content, setContent] = useState(review?.content ?? '');
  const [showPreview, setShowPreview] = useState(false);
  const [pros, setPros] = useState((review?.pros ?? []).join('\n'));
  const [cons, setCons] = useState((review?.cons ?? []).join('\n'));
  const [coverImage, setCoverImage] = useState(review?.coverImage ?? '');
  const [authorId, setAuthorId] = useState(review?.authorId ?? authors[0]?.id ?? '');
  const [status, setStatus] = useState<ContentStatus>(review?.status ?? 'DRAFT');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(newName: string) {
    setProductName(newName);
    if (!slugTouched) {
      setSlug(slugify(newName));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      await saveReview({
        id: review?.id,
        productName,
        slug,
        rating: Number(rating),
        summary,
        content,
        pros: pros.split('\n').map((s) => s.trim()).filter(Boolean),
        cons: cons.split('\n').map((s) => s.trim()).filter(Boolean),
        coverImage,
        authorId,
        status,
      });
    } catch (e) {
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
        setError(e.message);
        setPending(false);
      }
      throw e;
    }
  }

  async function handleDelete() {
    if (!review?.id) return;
    if (!confirm('Excluir este review definitivamente?')) return;
    await deleteReview(review.id);
    router.push('/admin/reviews');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome do produto</label>
        <input
          required
          value={productName}
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
        <label className="block text-sm font-medium text-gray-700">Nota (0 a 5)</label>
        <input
          required
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Resumo</label>
        <textarea
          required
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            {showPreview ? 'Editar' : 'Preview'}
          </button>
        </div>
        {showPreview ? (
          <div className="mt-1 min-h-[200px] space-y-3 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
            {content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Separe parágrafos com uma linha em branco"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prós (um por linha)</label>
          <textarea
            rows={4}
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contras (um por linha)</label>
          <textarea
            rows={4}
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
      </div>

      <CoverImageField value={coverImage} onChange={setCoverImage} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Autor</label>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentStatus)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="PUBLISHED">Publicado</option>
          </select>
        </div>
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
        {review?.id && (
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
