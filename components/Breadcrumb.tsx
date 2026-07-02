import Link from "next/link";

type Crumb = {
  label: string;
  href: string;
};

type Props = {
  crumbs: Crumb[];
};

export default function Breadcrumb({ crumbs }: Props) {
  return (
    <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {isLast ? (
                <span className="text-gray-800 font-medium">{crumb.label}</span>
              ) : (
                <>
                  <Link href={crumb.href} className="hover:text-gray-800 transition-colors">
                    {crumb.label}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
