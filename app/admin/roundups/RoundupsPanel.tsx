'use client';

import { useState } from 'react';
import { getEligibleReviewsForPilar, generateRoundup, type EligibleReview } from './actions';

type Option = { id: string; name: string };

type Props = {
  pilares: Option[];
  authors: Option[];
};

export function RoundupsPanel({ pilares, authors }: Props) {
  const [siloId, setSiloId] = useState(pilares[0]?.id ?? '');
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? '');
  const [reviews, setReviews] = useState<EligibleReview[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [generatePending, setGeneratePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function handleSelectSilo(newSiloId: string) {
    setSiloId(newSiloId);
    setLoaded(false);
    setReviews([]);
    setSelected(new Set());
  }

  async function handleLoadReviews() {
    if (!siloId) return;
    setLoadingReviews(true);
    setError(null);

    const result = await getEligibleReviewsForPilar(siloId);
    setLoadingReviews(false);
    setLoaded(true);
    setReviews(result);
    setSelected(new Set(result.map((r) => r.id)));
  }

  function toggleReview(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGenerate() {
    setGeneratePending(true);
    setError(null);

    try {
      const result = await generateRoundup(siloId, authorId, Array.from(selected));
      if (result?.error) {
        setError(result.error);
        setGeneratePending(false);
      }
    } catch (e) {
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
        setError(e.message);
        setGeneratePending(false);
      }
      throw e;
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Silo Pilar</label>
            <select
              value={siloId}
              onChange={(e) => handleSelectSilo(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              {pilares.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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

        <button
          type="button"
          onClick={handleLoadReviews}
          disabled={loadingReviews || !siloId}
          className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loadingReviews ? 'Carregando...' : 'Listar reviews deste silo'}
        </button>
      </div>

      {loaded && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Reviews aprovados/publicados neste silo
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum review agendado ou publicado encontrado neste silo ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {reviews.map((review) => (
                <label key={review.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(review.id)}
                    onChange={() => toggleReview(review.id)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium text-gray-900">{review.productName}</span>{' '}
                    <span className="text-gray-500">({review.rating != null ? `${review.rating}/5` : 'sem nota'})</span>
                    <br />
                    <span className="text-gray-500">{review.summary}</span>
                  </span>
                </label>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generatePending || selected.size < 2}
            className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {generatePending ? 'Gerando roundup...' : 'Gerar roundup'}
          </button>
          {selected.size < 2 && reviews.length > 0 && (
            <p className="mt-2 text-xs text-gray-400">Selecione ao menos 2 reviews.</p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
