import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const prev = currentPage > 1 ? currentPage - 1 : null;
  const next = currentPage < totalPages ? currentPage + 1 : null;

  const pageHref = (page: number) =>
    page === 1 ? basePath : `${basePath}?page=${page}`;

  return (
    <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Paginação">
      {prev !== null ? (
        <Link
          href={pageHref(prev)}
          className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          ← Anterior
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm border border-gray-200 rounded text-gray-300 cursor-not-allowed">
          ← Anterior
        </span>
      )}

      <span className="text-sm text-gray-600">
        {currentPage} / {totalPages}
      </span>

      {next !== null ? (
        <Link
          href={pageHref(next)}
          className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          Próxima →
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm border border-gray-200 rounded text-gray-300 cursor-not-allowed">
          Próxima →
        </span>
      )}
    </nav>
  );
}
