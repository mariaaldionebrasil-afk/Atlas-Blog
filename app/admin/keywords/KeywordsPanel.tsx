'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { importKeywords, checkCannibalization, updateKeywordStatus } from './actions';
import type { Keyword, Silo } from '@/lib/generated/prisma/client';

const statusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  CANIBALIZADA: 'Canibalizada',
  REMOVIDA: 'Removida',
};

const statusColor: Record<string, string> = {
  PENDENTE: 'bg-gray-100 text-gray-700',
  APROVADA: 'bg-green-100 text-green-700',
  CANIBALIZADA: 'bg-red-100 text-red-700',
  REMOVIDA: 'bg-gray-200 text-gray-500',
};

type Props = {
  keywords: (Keyword & { silo: Silo | null })[];
};

export function KeywordsPanel({ keywords }: Props) {
  const router = useRouter();
  const [importText, setImportText] = useState('');
  const [importPending, setImportPending] = useState(false);
  const [checkPending, setCheckPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    setImportPending(true);
    setError(null);
    setMessage(null);

    const result = await importKeywords(importText);
    setImportPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage(`${result.count} keyword(s) importada(s).`);
    setImportText('');
    router.refresh();
  }

  async function handleCheck() {
    setCheckPending(true);
    setError(null);
    setMessage(null);

    const result = await checkCannibalization();
    setCheckPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage(
      result.flaggedCount
        ? `${result.flaggedCount} keyword(s) sinalizada(s) com canibalização.`
        : 'Nenhum conflito encontrado.'
    );
    router.refresh();
  }

  async function handleStatusChange(id: string, status: 'APROVADA' | 'REMOVIDA' | 'PENDENTE') {
    await updateKeywordStatus(id, status);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <label className="block text-sm font-medium text-gray-700">
          Importar keywords (uma por linha, formato: <span className="font-mono text-xs">termo, intenção, volume, cpc</span>)
        </label>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={5}
          placeholder={'melhor bicicleta ergométrica, comercial, 1200, 2.50\ncomo escolher bicicleta ergométrica, informacional, 800, 1.10'}
          className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-gray-500 focus:outline-none"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleImport}
            disabled={importPending || !importText.trim()}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {importPending ? 'Importando...' : 'Importar'}
          </button>
          <button
            type="button"
            onClick={handleCheck}
            disabled={checkPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {checkPending ? 'Verificando...' : 'Verificar canibalização'}
          </button>
        </div>
        {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Termo</th>
              <th className="px-4 py-3">Intenção</th>
              <th className="px-4 py-3">Volume</th>
              <th className="px-4 py-3">CPC</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((keyword) => (
              <tr key={keyword.id} className="border-b border-gray-100 align-top last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{keyword.term}</td>
                <td className="px-4 py-3 text-gray-600">{keyword.searchIntent ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{keyword.volume ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{keyword.cpc ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[keyword.status]}`}>
                    {statusLabel[keyword.status]}
                  </span>
                  {keyword.cannibalizationNote && (
                    <p className="mt-1 max-w-xs text-xs text-red-600">{keyword.cannibalizationNote}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(keyword.id, 'APROVADA')}
                      className="text-xs font-medium text-green-700 hover:underline"
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(keyword.id, 'REMOVIDA')}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                    {keyword.status === 'CANIBALIZADA' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(keyword.id, 'PENDENTE')}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Marcar como resolvida
                      </button>
                    )}
                    {keyword.status === 'APROVADA' && keyword.siloId && (
                      <Link
                        href={`/admin/keywords/${keyword.id}/outline`}
                        className="text-xs font-medium text-gray-900 hover:underline"
                      >
                        Gerar tópicos
                      </Link>
                    )}
                    {keyword.status === 'APROVADA' &&
                      (keyword.silo?.type === 'APOIO' || keyword.silo?.type === 'SATELITE') && (
                        <Link
                          href={`/admin/keywords/${keyword.id}/review`}
                          className="text-xs font-medium text-purple-700 hover:underline"
                        >
                          Pesquisar e gerar review
                        </Link>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {keywords.length === 0 && (
          <p className="px-4 py-6 text-sm text-gray-500">Nenhuma keyword importada ainda.</p>
        )}
      </div>
    </div>
  );
}
