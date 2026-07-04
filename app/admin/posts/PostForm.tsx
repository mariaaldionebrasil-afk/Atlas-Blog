'use client';

import { useState } from 'react';
import Link from 'next/link';
import { slugify } from '@/lib/slugify';
import { CoverImageField } from '../CoverImageField';
import { savePost, deletePost, type PostInput } from './actions';
import { useRouter } from 'next/navigation';
import type { ContentStatus } from '@/lib/generated/prisma/enums';
import { renderContentParagraphs } from '@/components/RenderContent';

type Option = { id: string; name: string };

type Props = {
  post: PostInput | null;
  categories: Option[];
  authors: Option[];
};

export function PostForm({ post, categories, authors }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [showPreview, setShowPreview] = useState(false);
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '');
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? categories[0]?.id ?? '');
  const [authorId, setAuthorId] = useState(post?.authorId ?? authors[0]?.id ?? '');
  const [status, setStatus] = useState<ContentStatus>(post?.status ?? 'DRAFT');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (!slugTouched) {
      setSlug(slugify(newTitle));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      await savePost({
        id: post?.id,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        categoryId,
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
    if (!post?.id) return;
    if (!confirm('Excluir este post definitivamente?')) return;
    await deletePost(post.id);
    router.push('/admin/posts');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
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
        <label className="block text-sm font-medium text-gray-700">Resumo (excerpt)</label>
        <textarea
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
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
            {renderContentParagraphs(content)}
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

      {post?.outline && post.outline.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Outline (tópicos aprovados)</span>
            {post.keywordId && (
              <Link
                href={`/admin/keywords/${post.keywordId}/outline`}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Editar tópicos
              </Link>
            )}
          </div>
          <ul className="space-y-1 text-sm text-gray-700">
            {post.outline.map((topic, i) => (
              <li key={i} className={topic.level === 'H3' ? 'ml-4 text-gray-600' : 'font-medium'}>
                {topic.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <CoverImageField value={coverImage} onChange={setCoverImage} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? 'Salvando...' : 'Salvar'}
        </button>
        {post?.id && (
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
