'use client';

import { useState } from 'react';
import { generateCoverImageAction } from './generate-cover-action';

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export function CoverImageField({ value, onChange, label = 'Imagem de capa' }: Props) {
  const [mode, setMode] = useState<'idle' | 'ai' | 'manual'>('idle');
  const [prompt, setPrompt] = useState('');
  const [manualUrl, setManualUrl] = useState(value);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setPending(true);
    setError(null);
    const result = await generateCoverImageAction(prompt);
    setPending(false);

    if (result.error || !result.url) {
      setError(result.error ?? 'Erro ao gerar imagem.');
      return;
    }

    onChange(result.url);
    setMode('idle');
    setPrompt('');
  }

  function handleManualSave() {
    onChange(manualUrl.trim());
    setMode('idle');
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {value && (
        <img
          src={value}
          alt="Capa"
          className="mt-2 h-40 w-full rounded-md border border-gray-200 object-cover"
        />
      )}

      {mode === 'idle' && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Gerar com IA
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Colar URL manual
          </button>
        </div>
      )}

      {mode === 'ai' && (
        <div className="mt-2 space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva a imagem que você quer gerar..."
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={pending}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {pending ? 'Gerando...' : 'Gerar imagem'}
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {mode === 'manual' && (
        <div className="mt-2 space-y-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleManualSave}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Usar esta URL
            </button>
            <button
              type="button"
              onClick={() => setMode('idle')}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
