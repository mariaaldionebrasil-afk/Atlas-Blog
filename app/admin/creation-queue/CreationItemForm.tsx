'use client';

import { useEffect, useState } from 'react';
import { CoverImageField } from '../CoverImageField';
import { OutlineEditor } from './OutlineEditor';
import type { CreationItem } from './CreationQueuePanel';
import type { OutlineTopic } from './actions';
import {
  generateOutlineForItem,
  saveItemOutline,
  generateReviewForSkeleton,
  generateRoundupContent,
  getSiloReviewOptions,
  saveReviewMeta,
  saveRoundupMeta,
  savePostMeta,
} from './actions';
import { generateFullArticle } from '../posts/generateArticleAction';

type Option = { id: string; name: string };

type Props = {
  item: CreationItem;
  categories: Option[];
  authors: Option[];
};

function toItemKind(kind: CreationItem['kind']): 'REVIEW' | 'ROUNDUP' | 'POST' {
  if (kind === 'REVIEW') return 'REVIEW';
  if (kind === 'ARTIGO_SILO') return 'ROUNDUP';
  return 'POST';
}

export function CreationItemForm({ item, categories, authors }: Props) {
  const [topics, setTopics] = useState<OutlineTopic[]>(item.outline);
  const [categoryId, setCategoryId] = useState(item.categoryId ?? categories[0]?.id ?? '');
  const [authorId, setAuthorId] = useState(item.authorId ?? authors[0]?.id ?? '');
  const [coverImage, setCoverImage] = useState(item.coverImage ?? '');
  const [affiliateLinkAmazon, setAffiliateLinkAmazon] = useState(item.affiliateLinkAmazon ?? '');
  const [affiliateLinkMercadoLivre, setAffiliateLinkMercadoLivre] = useState(item.affiliateLinkMercadoLivre ?? '');
  const [comparedReviewIdA, setComparedReviewIdA] = useState(item.comparedReviewIdA ?? '');
  const [comparedReviewIdB, setComparedReviewIdB] = useState(item.comparedReviewIdB ?? '');
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>(item.reviewIds);
  const [siloReviews, setSiloReviews] = useState<{ id: string; productName: string; status: string }[]>([]);

  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const needsProductSelector = item.kind === 'ARTIGO_SILO' || item.kind === 'COMPARACAO';

  useEffect(() => {
    if (needsProductSelector && item.siloId) {
      getSiloReviewOptions(item.siloId).then(setSiloReviews);
    }
  }, [needsProductSelector, item.siloId]);

  async function handleGenerateOutline() {
    setGeneratingOutline(true);
    setError(null);
    const result = await generateOutlineForItem(toItemKind(item.kind), item.id);
    setGeneratingOutline(false);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setTopics(result.topics);
  }

  async function handleGenerateContent() {
    setGeneratingContent(true);
    setError(null);
    setMessage(null);

    await saveItemOutline(toItemKind(item.kind), item.id, topics);

    const result =
      item.kind === 'REVIEW'
        ? await generateReviewForSkeleton(item.id)
        : item.kind === 'ARTIGO_SILO'
          ? await generateRoundupContent(item.id)
          : await generateFullArticle(item.id);

    setGeneratingContent(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage('Texto gerado com sucesso.');
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const result =
      item.kind === 'REVIEW'
        ? await saveReviewMeta({
            id: item.id,
            categoryId,
            authorId,
            coverImage,
            affiliateLinkAmazon,
            affiliateLinkMercadoLivre,
          })
        : item.kind === 'ARTIGO_SILO'
          ? await saveRoundupMeta({ id: item.id, categoryId, authorId, reviewIds: selectedReviewIds })
          : await savePostMeta({
              id: item.id,
              categoryId,
              authorId,
              coverImage,
              affiliateLinkAmazon: item.kind === 'APOIO' ? affiliateLinkAmazon : undefined,
              affiliateLinkMercadoLivre: item.kind === 'APOIO' ? affiliateLinkMercadoLivre : undefined,
              comparedReviewIdA: item.kind === 'COMPARACAO' ? comparedReviewIdA : undefined,
              comparedReviewIdB: item.kind === 'COMPARACAO' ? comparedReviewIdB : undefined,
            });

    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage('Salvo com sucesso.');
  }

  function toggleReview(reviewId: string) {
    setSelectedReviewIds((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Tópicos (outline)</span>
          <button
            type="button"
            onClick={handleGenerateOutline}
            disabled={generatingOutline}
            className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
          >
            {generatingOutline ? 'Gerando...' : 'Gerar tópicos'}
          </button>
        </div>
        <OutlineEditor topics={topics} onChange={setTopics} />
      </div>

      {item.kind !== 'ARTIGO_SILO' && <CoverImageField value={coverImage} onChange={setCoverImage} />}

      {(item.kind === 'REVIEW' || item.kind === 'APOIO') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Link Amazon</label>
            <input
              type="url"
              value={affiliateLinkAmazon}
              onChange={(e) => setAffiliateLinkAmazon(e.target.value)}
              placeholder="https://amazon.com.br/..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Link Mercado Livre</label>
            <input
              type="url"
              value={affiliateLinkMercadoLivre}
              onChange={(e) => setAffiliateLinkMercadoLivre(e.target.value)}
              placeholder="https://mercadolivre.com.br/..."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {item.kind === 'ARTIGO_SILO' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Produtos incluídos (1 a 15)</label>
          <div className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-md border border-gray-200 p-2">
            {siloReviews.length === 0 && <p className="text-sm text-gray-400">Nenhum produto no mesmo silo ainda.</p>}
            {siloReviews.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selectedReviewIds.includes(r.id)} onChange={() => toggleReview(r.id)} />
                {r.productName}
              </label>
            ))}
          </div>
        </div>
      )}

      {item.kind === 'COMPARACAO' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Produto A</label>
            <select
              value={comparedReviewIdA}
              onChange={(e) => setComparedReviewIdA(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">Selecione</option>
              {siloReviews.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.productName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Produto B</label>
            <select
              value={comparedReviewIdB}
              onChange={(e) => setComparedReviewIdB(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">Selecione</option>
              {siloReviews.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.productName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

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

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleGenerateContent}
          disabled={generatingContent}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {generatingContent ? 'Gerando...' : 'Gerar texto completo'}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}
