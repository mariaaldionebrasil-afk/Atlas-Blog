const IMAGE_LINE = /^!\[(.*)\]\((.*)\)$/;
const H3_LINE = /^###\s+(.*)$/;
const H2_LINE = /^##\s+(.*)$/;

export function renderContentParagraphs(content: string) {
  return content.split('\n\n').map((block, i) => {
    const trimmed = block.trim();

    const imageMatch = trimmed.match(IMAGE_LINE);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={i} src={src} alt={alt} className="my-4 w-full rounded-lg object-cover" />;
    }

    const h3Match = trimmed.match(H3_LINE);
    if (h3Match) {
      return (
        <h3 key={i} className="mt-6 mb-2 text-xl font-semibold text-gray-900">
          {h3Match[1]}
        </h3>
      );
    }

    const h2Match = trimmed.match(H2_LINE);
    if (h2Match) {
      return (
        <h2 key={i} className="mt-8 mb-2 text-2xl font-bold text-gray-900">
          {h2Match[1]}
        </h2>
      );
    }

    return <p key={i}>{block}</p>;
  });
}
