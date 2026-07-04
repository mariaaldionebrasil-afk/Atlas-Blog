import Link from 'next/link';
import { LogoutButton } from './logout-button';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/keywords', label: 'Keywords' },
  { href: '/admin/silos', label: 'Silos' },
  { href: '/admin/queue', label: 'Fila' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/roundups', label: 'Roundups' },
  { href: '/admin/categories', label: 'Categorias' },
  { href: '/admin/authors', label: 'Autores' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div>
          <div className="px-4 py-5">
            <p className="text-sm font-semibold text-gray-900">Atlas Blog</p>
            <p className="text-xs text-gray-500">Painel Administrativo</p>
          </div>
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto px-4 py-4">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
