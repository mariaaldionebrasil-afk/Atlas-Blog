'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  generateSiloStructure,
  saveSiloStructure,
  type ProposedSilo,
  type SiloProposal,
} from './actions';

export type SiloTreeNode = {
  id: string;
  name: string;
  type: 'PILAR' | 'APOIO' | 'SATELITE';
  keywords: { id: string; term: string }[];
  children: SiloTreeNode[];
};

const typeLabel: Record<string, string> = {
  PILAR: 'Pilar',
  APOIO: 'Apoio',
  SATELITE: 'Satélite',
};

function ExistingSiloNode({ node, depth = 0 }: { node: SiloTreeNode; depth?: number }) {
  return (
    <div style={{ marginLeft: depth * 20 }} className="mt-2">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {typeLabel[node.type]}
        </span>
        <span className="font-medium text-gray-900">{node.name}</span>
      </div>
      {node.keywords.length > 0 && (
        <ul className="ml-6 mt-1 list-disc text-sm text-gray-600">
          {node.keywords.map((k) => (
            <li key={k.id}>{k.term}</li>
          ))}
        </ul>
      )}
      {node.children.map((child) => (
        <ExistingSiloNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

type Props = {
  existingPilares: SiloTreeNode[];
};

export function SilosPanel({ existingPilares }: Props) {
  const router = useRouter();
  const [proposal, setProposal] = useState<SiloProposal | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});
  const [silos, setSilos] = useState<ProposedSilo[]>([]);
  const [generatePending, setGeneratePending] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setGeneratePending(true);
    setError(null);
    setMessage(null);

    const result = await generateSiloStructure();
    setGeneratePending(false);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setProposal(result);
    setSilos(result.silos);
    setAssignments(result.assignments);
  }

  function handleRenameSilo(tempId: string, name: string) {
    setSilos((prev) => prev.map((s) => (s.tempId === tempId ? { ...s, name } : s)));
  }

  function handleReassign(keywordId: string, tempId: string) {
    setAssignments((prev) => ({ ...prev, [keywordId]: tempId || null }));
  }

  async function handleApprove() {
    setSavePending(true);
    setError(null);
    setMessage(null);

    try {
      await saveSiloStructure({ silos, assignments });
      setMessage('Estrutura de silo salva com sucesso.');
      setProposal(null);
      setSilos([]);
      setAssignments({});
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar a estrutura.');
    } finally {
      setSavePending(false);
    }
  }

  const silosByParent = groupByParent(silos);

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generatePending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {generatePending ? 'Gerando...' : 'Gerar estrutura de silo'}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
      </div>

      {proposal && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Estrutura proposta (edite antes de aprovar)</h2>

          <div className="space-y-3">
            {renderSiloTree(null, silosByParent, handleRenameSilo)}
          </div>

          <h3 className="mb-2 mt-6 text-sm font-semibold text-gray-900">Keywords aprovadas</h3>
          <div className="overflow-hidden rounded-md border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-3 py-2">Termo</th>
                  <th className="px-3 py-2">Silo</th>
                </tr>
              </thead>
              <tbody>
                {proposal.keywords.map((kw) => (
                  <tr key={kw.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-3 py-2">{kw.term}</td>
                    <td className="px-3 py-2">
                      <select
                        value={assignments[kw.id] ?? ''}
                        onChange={(e) => handleReassign(kw.id, e.target.value)}
                        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
                      >
                        <option value="">Nenhum (remover da estrutura)</option>
                        {silos.map((s) => (
                          <option key={s.tempId} value={s.tempId}>
                            {typeLabel[s.type]} — {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleApprove}
            disabled={savePending}
            className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {savePending ? 'Salvando...' : 'Aprovar estrutura'}
          </button>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Estrutura já aprovada</h2>
        {existingPilares.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma estrutura de silo aprovada ainda.</p>
        ) : (
          existingPilares.map((pilar) => <ExistingSiloNode key={pilar.id} node={pilar} />)
        )}
      </div>
    </div>
  );
}

function groupByParent(silos: ProposedSilo[]) {
  const map = new Map<string | null, ProposedSilo[]>();
  for (const s of silos) {
    const key = s.parentTempId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return map;
}

function renderSiloTree(
  parentTempId: string | null,
  silosByParent: Map<string | null, ProposedSilo[]>,
  onRename: (tempId: string, name: string) => void,
  depth = 0
) {
  const children = silosByParent.get(parentTempId) ?? [];
  return children.map((s) => (
    <div key={s.tempId} style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {typeLabel[s.type]}
        </span>
        <input
          value={s.name}
          onChange={(e) => onRename(s.tempId, e.target.value)}
          className="w-72 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div className="mt-2">{renderSiloTree(s.tempId, silosByParent, onRename, depth + 1)}</div>
    </div>
  ));
}
