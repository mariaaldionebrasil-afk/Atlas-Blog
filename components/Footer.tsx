import Link from "next/link";
import type { SiteConfig } from "../lib/types";

type Props = {
  config: SiteConfig;
};

export default function Footer({ config }: Props) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="mx-auto max-w-5xl px-4 py-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-gray-900 mb-3">{config.siteName}</p>
          <p className="text-sm text-gray-500">
            Conteúdo informacional, reviews e guias práticos.
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-3">Categorias</p>
          <ul className="space-y-2">
            {config.categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-gray-900 mb-3">Links</p>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Sobre
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Contato
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Termos de Uso
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {config.siteName} · Todos os direitos reservados
      </div>
    </footer>
  );
}
