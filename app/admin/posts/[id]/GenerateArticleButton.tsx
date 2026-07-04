'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateFullArticle } from '../generateArticleAction';

export function GenerateArticleButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    const result = await generateFullArticle(postId);
    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mb-6 max-w-2xl rounded-lg border border-gray-200 bg-white p-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? 'Gerando artigo completo...' : 'Gerar artigo completo'}
      </button>
      <p className="mt-1 text-xs text-gray-500">
        Gera o texto completo a partir do outline aprovado e insere imagens nos pontos relevantes.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
