import Link from "next/link";
import type { Author } from "../lib/types";

type Props = {
  siteName: string;
  authors: Author[];
};

export default function AboutTeaser({ siteName, authors }: Props) {
  return (
    <section className="mt-16 rounded-lg bg-gray-900 text-white px-8 py-10">
      <h2 className="text-xl font-bold mb-3">Quem está por trás do {siteName}?</h2>

      {authors.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {authors.map((author) => (
            <div key={author.slug} className="flex items-center gap-2">
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
                ) : (
                  author.name.charAt(0)
                )}
              </div>
              <span className="text-sm text-gray-300">{author.name}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-300 leading-relaxed max-w-2xl">
        Somos uma equipe de jornalistas, educadores e especialistas que acreditam que boas decisões
        começam com informação honesta. Testamos os produtos que recomendamos, citamos as fontes que
        usamos e nunca aceitamos conteúdo patrocinado sem identificação clara.
      </p>
      <Link
        href="/about"
        className="mt-6 inline-block px-5 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
      >
        Conheça nossa equipe →
      </Link>
    </section>
  );
}
