'use client';

import { useRef, useState } from 'react';
import { generateCoverImageAction } from './generate-cover-action';
import { uploadCoverImageAction } from './upload-cover-action';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export function CoverImageField({ value, onChange, label = 'Imagem de capa' }: Props) {
  const [mode, setMode] = useState<'idle' | 'ai' | 'manual' | 'upload'>('idle');
  const [prompt, setPrompt] = useState('');
  const [manualUrl, setManualUrl] = useState(value);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleFile(file: File) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato inválido. Use PNG, JPEG ou WEBP.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Arquivo muito grande. O limite é 5MB.');
      return;
    }

    setPending(true);
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadCoverImageAction(formData);
    setPending(false);

    if (result.error || !result.url) {
      setError(result.error ?? 'Erro ao enviar imagem.');
      return;
    }

    onChange(result.url);
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
          <button
            type="button"
            onClick={() => setMode('upload')}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Fazer upload
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

      {mode === 'upload' && (
        <div className="mt-2 space-y-2">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
              dragActive ? 'border-gray-500 bg-gray-50' : 'border-gray-300'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <p className="text-sm text-gray-600">Arraste uma imagem aqui ou clique para selecionar</p>
            <p className="text-xs text-gray-400">PNG, JPEG ou WEBP, até 5MB</p>
            {pending && <p className="text-sm text-gray-500">Enviando...</p>}
          </div>
          <button
            type="button"
            onClick={() => setMode('idle')}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
