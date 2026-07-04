'use client';

import { useState } from 'react';
import { researchAndGenerateReview } from './actions';

type Option = { id: string; name: string };

type Props = {
  keywordId: string;
  authors: Option[];
};

export function ReviewGeneratePanel({ keywordId, authors }: Props) {
  const [authorId, setAuthorId] = useState(authors[0]?.id ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setPending(true);
    setError(null);

    try {
      const result = await researchAndGenerateReview(keywordId, authorId);
      if (result?.error) {
        setError(result.error);
        setPending(false);
      }
    } catch (e) {
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
        setError(e.message);
        setPending(false);
      }
      throw e;
    }
  }

  return (
    <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-5">
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

      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending || !authorId}
        className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? 'Pesquisando e gerando review...' : 'Pesquisar e gerar review'}
      </button>
      <p className="mt-2 text-xs text-gray-500">
        A IA pesquisa informações reais sobre o produto (Grounding com Google Search), escreve o
        review e lista as fontes usadas para você confirmar antes de aprovar.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
