'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleReviewItem, scheduleRoundupItem, schedulePostItem } from './actions';

export type PublishItemType = 'REVIEW' | 'ARTIGO_SILO' | 'APOIO' | 'INFORMACIONAL' | 'COMPARACAO';

export type PublishItem = {
  kind: PublishItemType;
  id: string;
  title: string;
  siloName: string;
  categoryName: string;
  authorName: string;
  dependencies: { label: string; ready: boolean }[];
};

const kindLabel: Record<PublishItemType, string> = {
  REVIEW: 'Single Product Review',
  ARTIGO_SILO: 'Artigo Silo',
  APOIO: 'Apoio',
  INFORMACIONAL: 'Informacional',
  COMPARACAO: 'Comparação',
};

const kindColor: Record<PublishItemType, string> = {
  REVIEW: 'bg-purple-100 text-purple-700',
  ARTIGO_SILO: 'bg-blue-100 text-blue-700',
  APOIO: 'bg-amber-100 text-amber-700',
  INFORMACIONAL: 'bg-gray-100 text-gray-700',
  COMPARACAO: 'bg-pink-100 text-pink-700',
};

function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

function Row({ item }: { item: PublishItem }) {
  const router = useRouter();
  const [scheduledDate, setScheduledDate] = useState(defaultDateTime());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = item.dependencies.some((d) => !d.ready);

  async function handleSchedule() {
    setPending(true);
    setError(null);

    const result =
      item.kind === 'REVIEW'
        ? await scheduleReviewItem(item.id, scheduledDate)
        : item.kind === 'ARTIGO_SILO'
          ? await scheduleRoundupItem(item.id, scheduledDate)
          : await schedulePostItem(item.id, scheduledDate);

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${kindColor[item.kind]}`}>
        {kindLabel[item.kind]}
      </span>
      <h2 className="mt-1 font-semibold text-gray-900">{item.title}</h2>
      <p className="mt-1 text-xs text-gray-400">
        {item.categoryName} · {item.authorName}
      </p>

      {item.dependencies.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.dependencies.map((d) => (
            <span
              key={d.label}
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                d.ready ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {d.ready ? '✓' : '✕'} {d.label}
            </span>
          ))}
        </div>
      )}

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
          onClick={handleSchedule}
          disabled={pending || blocked}
          title={blocked ? 'Agende primeiro as dependências marcadas em vermelho.' : undefined}
          className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {pending ? 'Agendando...' : 'Aprovar e agendar'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function PublishQueuePanel({ items }: { items: PublishItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Nenhum item pronto para publicação. Um item aparece aqui quando o texto completo já foi gerado na Fila de
        Criação e ainda está como Rascunho.
      </p>
    );
  }

  let lastSilo: string | null = null;

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const showSiloHeader = item.siloName !== lastSilo;
        lastSilo = item.siloName;

        return (
          <div key={`${item.kind}-${item.id}`}>
            {showSiloHeader && (
              <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400 first:mt-0">
                {item.siloName}
              </h2>
            )}
            <Row item={item} />
          </div>
        );
      })}
    </div>
  );
}
