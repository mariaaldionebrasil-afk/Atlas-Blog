import Link from "next/link";
import type { SiteConfig } from "../lib/types";

type Props = {
  config: SiteConfig;
};

export default function Header({ config }: Props) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          {config.siteName}
        </Link>
        <nav className="flex gap-6">
          {config.menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
