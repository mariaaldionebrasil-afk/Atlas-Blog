'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { renderContentParagraphs } from '@/components/RenderContent';
import { approveReviewSchedule } from './actions';

export type SourceUrl = { title: string; url: string };

type Props = {
  reviewId: string;
  productName: string;
  content: string;
  sourceUrls: SourceUrl[];
};

function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export function ApprovalPanel({ reviewId, productName, content, sourceUrls }: Props) {
  const router = useRouter();
  const [sourcesConfirmed, setSourcesConfirmed] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(defaultDateTime());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setPending(true);
    setError(null);

    const result = await approveReviewSchedule(reviewId, scheduledDate);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/admin/reviews');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Review gerado: {productName}</h2>
          <div className="max-h-[500px] space-y-3 overflow-y-auto text-sm text-gray-700">
            {renderContentParagraphs(content)}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Fontes usadas na pesquisa</h2>
          {sourceUrls.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma fonte retornada pela IA.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {sourceUrls.map((source, i) => (
                <li key={i}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={sourcesConfirmed}
            onChange={(e) => setSourcesConfirmed(e.target.checked)}
            className="mt-0.5"
          />
          Confirmo que as fontes acima são adequadas e o conteúdo reflete informações reais sobre o produto.
        </label>

        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
          <Link
            href={`/admin/reviews/${reviewId}`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Editar texto
          </Link>
          <label className="text-sm text-gray-600">Publicar em:</label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            disabled={!sourcesConfirmed}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleApprove}
            disabled={!sourcesConfirmed || pending}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {pending ? 'Agendando...' : 'Aprovar e agendar'}
          </button>
        </div>
        {!sourcesConfirmed && (
          <p className="mt-2 text-xs text-gray-400">
            Confirme as fontes acima para liberar o agendamento.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
