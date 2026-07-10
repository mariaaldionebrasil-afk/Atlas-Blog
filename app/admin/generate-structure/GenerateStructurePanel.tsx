'use client';

import { useState } from 'react';
import {
  runGenerateStructure,
  approveStructure,
  type StructureItem,
  type StructureItemType,
  type StructureProposal,
} from './actions';

const typeLabel: Record<StructureItemType, string> = {
  SINGLE_PRODUCT_REVIEW: 'Single Product Review',
  ARTIGO_SILO: 'Artigo Silo',
  APOIO: 'Apoio',
  INFORMACIONAL: 'Informacional',
  COMPARACAO: 'Comparação',
};

export function GenerateStructurePanel() {
  const [seedKeyword, setSeedKeyword] = useState('');
  const [proposal, setProposal] = useState<StructureProposal | null>(null);
  const [generatePending, setGeneratePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setGeneratePending(true);
    setError(null);
    setMessage(null);

    const result = await runGenerateStructure(seedKeyword.trim());
    setGeneratePending(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setProposal(result);
  }

  function updateItem(index: number, patch: Partial<StructureItem>) {
    setProposal((prev) =>
      prev ? { ...prev, items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) } : prev
    );
  }

  function removeItem(index: number) {
    setProposal((prev) => (prev ? { ...prev, items: prev.items.filter((_, i) => i !== index) } : prev));
  }

  async function handleApprove() {
    if (!proposal) return;
    setSavePending(true);
    setError(null);
    setMessage(null);

    try {
      await approveStructure(proposal);
      setMessage('Estrutura salva com sucesso.');
      setProposal(null);
      setSeedKeyword('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar a estrutura.');
    } finally {
      setSavePending(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <label className="block text-sm font-medium text-gray-700">Keyword semente</label>
        <input
          value={seedKeyword}
          onChange={(e) => setSeedKeyword(e.target.value)}
          placeholder="ex: bicicleta ergométrica"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generatePending || seedKeyword.trim().length === 0}
          className="mt-3 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {generatePending ? 'Gerando...' : 'Gerar estrutura completa'}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
      </div>

      {proposal && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900">{proposal.silo.name}</h2>
          <p className="mb-4 text-xs text-gray-500">Keyword semente: {proposal.silo.seedKeyword}</p>

          <div className="space-y-2">
            {proposal.items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={item.type}
                  onChange={(e) => updateItem(index, { type: e.target.value as StructureItemType })}
                  className="rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:border-gray-500 focus:outline-none"
                >
                  {Object.entries(typeLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <input
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                />
                <span className="w-40 shrink-0 truncate text-xs text-gray-400" title={item.keyword}>
                  {item.keyword}
                </span>
                <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleApprove}
            disabled={savePending}
            className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {savePending ? 'Salvando...' : 'Aprovar e salvar estrutura'}
          </button>
        </div>
      )}
    </div>
  );
}
