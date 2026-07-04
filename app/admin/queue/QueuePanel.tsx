'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { approveForSchedule } from './actions';

export type QueuedPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
};

function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

function Row({ post }: { post: QueuedPost }) {
  const router = useRouter();
  const [scheduledDate, setScheduledDate] = useState(defaultDateTime());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setPending(true);
    setError(null);

    const result = await approveForSchedule(post.id, scheduledDate);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">{post.title}</h2>
          <p className="mt-1 text-sm text-gray-600">{post.excerpt}</p>
          <p className="mt-1 text-xs text-gray-400">
            {post.category} · {post.author}
          </p>
        </div>
        <Link
          href={`/admin/posts/${post.id}`}
          className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Editar texto
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
        <label className="text-sm text-gray-600">Publicar em:</label>
        <input
          type="datetime-local"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleApprove}
          disabled={pending}
          className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? 'Agendando...' : 'Aprovar e agendar'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function QueuePanel({ posts }: { posts: QueuedPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Nenhum post pronto para revisão. Um post aparece aqui quando tem outline e artigo completo gerados,
        e ainda está como Rascunho.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Row key={post.id} post={post} />
      ))}
    </div>
  );
}
