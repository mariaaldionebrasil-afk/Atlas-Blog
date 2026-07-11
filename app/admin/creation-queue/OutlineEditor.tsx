'use client';

import type { OutlineTopic } from './actions';

export type { OutlineTopic };

type Props = {
  topics: OutlineTopic[];
  onChange: (topics: OutlineTopic[]) => void;
};

export function OutlineEditor({ topics, onChange }: Props) {
  function updateTopic(index: number, patch: Partial<OutlineTopic>) {
    onChange(topics.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTopic(index: number) {
    onChange(topics.filter((_, i) => i !== index));
  }

  function moveTopic(index: number, direction: -1 | 1) {
    const next = [...topics];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addTopic() {
    onChange([...topics, { level: 'H2', text: '' }]);
  }

  return (
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
      <button type="button" onClick={addTopic} className="text-sm font-medium text-blue-600 hover:underline">
        + Adicionar tópico
      </button>
    </div>
  );
}
