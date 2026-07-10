'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveRoundup, scheduleRoundup, deleteRoundup } from './actions';
import type { ContentStatus } from '@/lib/generated/prisma/enums';

export type RoundupItemView = {
  id: string;
  reviewId: string;
  productName: string;
  rating: number | null;
  reviewSlug: string;
};

type Props = {
  roundupId: string;
  status: ContentStatus;
  title: string;
  slug: string;
  snippet: string;
  introContent: string;
  items: RoundupItemView[];
};

const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendado',
  PUBLISHED: 'Publicado',
};

function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export function RoundupForm({ roundupId, status, title: initialTitle, slug: initialSlug, snippet: initialSnippet, introContent: initialIntro, items: initialItems }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [snippet, setSnippet] = useState(initialSnippet);
  const [introContent, setIntroContent] = useState(initialIntro);
  const [items, setItems] = useState(initialItems);
  const [scheduledDate, setScheduledDate] = useState(defaultDateTime());
  const [savePending, setSavePending] = useState(false);
  const [schedulePending, setSchedulePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function moveItem(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    setSavePending(true);
    setError(null);
    setMessage(null);

    const result = await saveRoundup({
      id: roundupId,
      title,
      slug,
      snippet,
      introContent,
      itemIdsInOrder: items.map((i) => i.id),
    });

    setSavePending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage('Salvo com sucesso.');
    router.refresh();
  }

  async function handleSchedule() {
    setSchedulePending(true);
    setError(null);

    const result = await scheduleRoundup(roundupId, scheduledDate);
    setSchedulePending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm('Excluir este roundup definitivamente?')) return;
    await deleteRoundup(roundupId);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            {statusLabel[status]}
          </span>
        </div>

        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />

        <label className="mt-3 block text-sm font-medium text-gray-700">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-gray-500 focus:outline-none"
        />

        <label className="mt-3 block text-sm font-medium text-gray-700">Snippet (meta description)</label>
        <textarea
          rows={2}
          value={snippet}
          onChange={(e) => setSnippet(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />

        <label className="mt-3 block text-sm font-medium text-gray-700">Texto de introdução</label>
        <textarea
          rows={6}
          value={introContent}
          onChange={(e) => setIntroContent(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Ranking dos produtos</h2>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-md border border-gray-100 px-3 py-2">
              <span className="w-6 text-sm font-semibold text-gray-400">#{index + 1}</span>
              <div className="flex-1 text-sm">
                <span className="font-medium text-gray-900">{item.productName}</span>{' '}
                <span className="text-gray-500">({item.rating != null ? `${item.rating}/5` : 'sem nota'})</span>
              </div>
              <Link
                href={`/admin/reviews/${item.reviewId}`}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Ver review
              </Link>
              <button type="button" onClick={() => moveItem(index, -1)} className="text-gray-400 hover:text-gray-700">
                ↑
              </button>
              <button type="button" onClick={() => moveItem(index, 1)} className="text-gray-400 hover:text-gray-700">
                ↓
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={savePending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {savePending ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Excluir
        </button>
      </div>
      {message && <p className="text-sm text-green-700">{message}</p>}

      {status !== 'PUBLISHED' && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Agendar publicação</h2>
          <div className="flex items-center gap-3">
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSchedule}
              disabled={schedulePending}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {schedulePending ? 'Agendando...' : 'Aprovar e agendar'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
