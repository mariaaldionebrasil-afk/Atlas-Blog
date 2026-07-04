'use client';

import { useState } from 'react';
import { generateOutline, approveOutline, type OutlineTopic } from './actions';

type Option = { id: string; name: string };

type Props = {
  keywordId: string;
  existingPost: { id: string; categoryId: string; authorId: string; outline: OutlineTopic[] } | null;
  categories: Option[];
  authors: Option[];
};

export function OutlinePanel({ keywordId, existingPost, categories, authors }: Props) {
  const [topics, setTopics] = useState<OutlineTopic[]>(existingPost?.outline ?? []);
  const [categoryId, setCategoryId] = useState(existingPost?.categoryId ?? categories[0]?.id ?? '');
  const [authorId, setAuthorId] = useState(existingPost?.authorId ?? authors[0]?.id ?? '');
  const [generatePending, setGeneratePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGeneratePending(true);
    setError(null);

    const result = await generateOutline(keywordId);
    setGeneratePending(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setTopics(result.topics);
  }

  function updateTopic(index: number, patch: Partial<OutlineTopic>) {
    setTopics((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTopic(index: number) {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  }

  function moveTopic(index: number, direction: -1 | 1) {
    setTopics((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addTopic() {
    setTopics((prev) => [...prev, { level: 'H2', text: '' }]);
  }

  async function handleApprove() {
    setSavePending(true);
    setError(null);

    try {
      await approveOutline({
        keywordId,
        postId: existingPost?.id,
        topics,
        categoryId,
        authorId,
      });
    } catch (e) {
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
        setError(e.message);
        setSavePending(false);
      }
      throw e;
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generatePending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {generatePending ? 'Gerando...' : 'Gerar tópicos'}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {topics.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Outline</h2>
          <div className="space-y-2">
            {topics.map((topic, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={topic.level}
                  onChange={(e) => updateTopic(index, { level: e.target.value as 'H2' | 'H3' })}
                  className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
                >
                  <option value="H2">H2</option>
                  <option value="H3">H3</option>
                </select>
                <input
                  value={topic.text}
                  onChange={(e) => updateTopic(index, { text: e.target.value })}
                  className={`flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none ${
                    topic.level === 'H3' ? 'ml-4' : ''
                  }`}
                />
                <button type="button" onClick={() => moveTopic(index, -1)} className="text-gray-400 hover:text-gray-700">
                  ↑
                </button>
                <button type="button" onClick={() => moveTopic(index, 1)} className="text-gray-400 hover:text-gray-700">
                  ↓
                </button>
                <button type="button" onClick={() => removeTopic(index)} className="text-red-500 hover:text-red-700">
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTopic}
            className="mt-3 text-sm font-medium text-blue-600 hover:underline"
          >
            + Adicionar tópico
          </button>
        </div>
      )}

      {topics.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Categoria e autor do post</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
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
            onClick={handleApprove}
            disabled={savePending || !categoryId || !authorId}
            className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {savePending ? 'Salvando...' : 'Aprovar tópicos'}
          </button>
        </div>
      )}
    </div>
  );
}
