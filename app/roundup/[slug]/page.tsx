import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Breadcrumb from "../../../components/Breadcrumb";
import AffiliateButton from "../../../components/AffiliateButton";
import siteConfig from "../../../config/site.config";
import { prisma } from "../../../lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

type Faq = { question: string; answer: string };

export async function generateStaticParams() {
  const roundups = await prisma.roundup.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return roundups.map((r) => ({ slug: r.slug }));
}

export default async function RoundupPage({ params }: Props) {
  const { slug } = await params;
  const roundup = await prisma.roundup.findUnique({
    where: { slug },
    include: {
      items: {
        include: { review: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!roundup || roundup.status !== "PUBLISHED") notFound();

  const items = roundup.items;
  const topPick = items[0]?.review;
  const faq = (roundup.faq as unknown as Faq[] | null) ?? [];

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Reviews", href: "/reviews" },
    { label: roundup.title, href: `/roundup/${roundup.slug}` },
  ];

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-4xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{roundup.title}</h1>
        <p className="mt-2 text-gray-500">{roundup.snippet}</p>

        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Este artigo contém links de afiliado. Podemos receber uma comissão por compras
          feitas através deles, sem custo adicional para você.
        </div>

        {topPick && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Nossa escolha número 1
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">{topPick.productName}</h2>
            <p className="mt-1 text-sm text-gray-600">{topPick.summary}</p>
          </div>
        )}

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-4">Produto</th>
                <th className="py-2 pr-4">Preço</th>
                <th className="py-2 pr-4">Nota</th>
                <th className="py-2 pr-4">Comprar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {item.review.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.review.coverImage}
                          alt={item.review.productName}
                          className="h-14 w-14 rounded-md object-cover"
                        />
                      )}
                      <span className="font-medium text-gray-900">{item.review.productName}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{item.review.price ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-600">{item.review.rating}/5</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-2">
                      {item.review.affiliateLinkAmazon && (
                        <AffiliateButton label="Ver na Amazon" url={item.review.affiliateLinkAmazon} />
                      )}
                      {item.review.affiliateLinkMercadoLivre && (
                        <AffiliateButton
                          label="Ver no Mercado Livre"
                          url={item.review.affiliateLinkMercadoLivre}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <article className="mt-8 space-y-4 text-gray-700 leading-relaxed">
          {roundup.introContent.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>

        <div className="mt-10 space-y-8">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-bold text-gray-900">
                #{index + 1} {item.review.productName}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{item.review.summary}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-green-700">Prós</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {item.review.pros.slice(0, 3).map((pro, i) => (
                      <li key={i}>✓ {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-red-700">Contras</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {item.review.cons.slice(0, 3).map((con, i) => (
                      <li key={i}>✗ {con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {item.review.affiliateLinkAmazon && (
                  <AffiliateButton label="Ver na Amazon" url={item.review.affiliateLinkAmazon} />
                )}
                {item.review.affiliateLinkMercadoLivre && (
                  <AffiliateButton label="Ver no Mercado Livre" url={item.review.affiliateLinkMercadoLivre} />
                )}
                <Link href={`/review/${item.review.slug}`} className="text-sm text-blue-600 hover:underline">
                  Ver review completo →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {faq.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Perguntas frequentes</h2>
            <div className="space-y-4">
              {faq.map((f, i) => (
                <div key={i}>
                  <p className="font-medium text-gray-900">{f.question}</p>
                  <p className="mt-1 text-sm text-gray-600">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
