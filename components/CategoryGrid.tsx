import Link from "next/link";
import type { Category } from "../lib/types";

type Props = {
  categories: Category[];
};

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorar por categoria</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group block rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {cat.name}
            </h3>
            {cat.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{cat.description}</p>
            )}
            <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:underline">
              Ver artigos →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
