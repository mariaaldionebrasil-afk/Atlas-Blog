'use client';

import { useState } from 'react';
import { CreationItemForm } from './CreationItemForm';
import type { OutlineTopic } from './actions';

export type ItemType = 'REVIEW' | 'ARTIGO_SILO' | 'APOIO' | 'INFORMACIONAL' | 'COMPARACAO';

export type CreationItem = {
  kind: ItemType;
  id: string;
  title: string;
  siloId: string | null;
  siloName: string;
  outline: OutlineTopic[];
  categoryId: string | null;
  authorId: string | null;
  coverImage: string | null;
  affiliateLinkAmazon: string | null;
  affiliateLinkMercadoLivre: string | null;
  comparedReviewIdA: string | null;
  comparedReviewIdB: string | null;
  reviewIds: string[];
};

const kindLabel: Record<ItemType, string> = {
  REVIEW: 'Single Product Review',
  ARTIGO_SILO: 'Artigo Silo',
  APOIO: 'Apoio',
  INFORMACIONAL: 'Informacional',
  COMPARACAO: 'Comparação',
};

const kindColor: Record<ItemType, string> = {
  REVIEW: 'bg-purple-100 text-purple-700',
  ARTIGO_SILO: 'bg-blue-100 text-blue-700',
  APOIO: 'bg-amber-100 text-amber-700',
  INFORMACIONAL: 'bg-gray-100 text-gray-700',
  COMPARACAO: 'bg-pink-100 text-pink-700',
};

type Option = { id: string; name: string };

type Props = {
  items: CreationItem[];
  categories: Option[];
  authors: Option[];
};

export function CreationQueuePanel({ items, categories, authors }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum item pendente na Fila de Criação.</p>;
  }

  let lastSilo: string | null = null;

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const showSiloHeader = item.siloName !== lastSilo;
        lastSilo = item.siloName;

        return (
          <div key={`${item.kind}-${item.id}`}>
            {showSiloHeader && (
              <h2 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400 first:mt-0">
                {item.siloName}
              </h2>
            )}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${kindColor[item.kind]}`}>
                    {kindLabel[item.kind]}
                  </span>
                  <span className="font-medium text-gray-900">{item.title}</span>
                </span>
                <span className="text-gray-400">{expandedId === item.id ? '▲' : '▼'}</span>
              </button>

              {expandedId === item.id && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <CreationItemForm item={item} categories={categories} authors={authors} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
