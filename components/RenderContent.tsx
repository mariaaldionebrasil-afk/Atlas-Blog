import type { ReactNode } from 'react';

const IMAGE_LINE = /^!\[(.*)\]\((.*)\)$/;
const H3_LINE = /^###\s+(.*)$/;
const H2_LINE = /^##\s+(.*)$/;
const H1_LINE = /^#\s+(.*)$/;
const BULLET_LINE = /^[*-]\s+(.*)$/;
const BOLD = /\*\*(.+?)\*\*/g;

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  BOLD.lastIndex = 0;
  while ((match = BOLD.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(<strong key={key++}>{match[1]}</strong>);
    lastIndex = BOLD.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export function renderContentParagraphs(content: string, keyPrefix = '') {
  return content.split('\n\n').map((block, i) => {
    const trimmed = block.trim();
    const key = `${keyPrefix}${i}`;

    if (trimmed.startsWith('<table')) {
      return (
        <div
          key={key}
          className="my-6 overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-gray-200 [&_td]:px-3 [&_td]:py-2"
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
      );
    }

    const imageMatch = trimmed.match(IMAGE_LINE);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={src} alt={alt} className="my-4 w-full rounded-lg object-cover" />;
    }

    const h3Match = trimmed.match(H3_LINE);
    if (h3Match) {
      return (
        <h3 key={key} className="mt-6 mb-2 text-xl font-semibold text-gray-900">
          {renderInline(h3Match[1])}
        </h3>
      );
    }

    const h2Match = trimmed.match(H2_LINE);
    if (h2Match) {
      return (
        <h2 key={key} className="mt-8 mb-2 text-2xl font-bold text-gray-900">
          {renderInline(h2Match[1])}
        </h2>
      );
    }

    const h1Match = trimmed.match(H1_LINE);
    if (h1Match) {
      return (
        <h2 key={key} className="mt-8 mb-2 text-2xl font-bold text-gray-900">
          {renderInline(h1Match[1])}
        </h2>
      );
    }

    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    const isBulletList = lines.length > 0 && lines.every((l) => BULLET_LINE.test(l));
    if (isBulletList) {
      return (
        <ul key={key} className="list-disc space-y-1 pl-5">
          {lines.map((line, j) => {
            const itemMatch = line.match(BULLET_LINE);
            return <li key={j}>{renderInline(itemMatch ? itemMatch[1] : line)}</li>;
          })}
        </ul>
      );
    }

    return <p key={key}>{renderInline(block)}</p>;
  });
}
