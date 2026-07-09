import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Breadcrumb from "../../../components/Breadcrumb";
import AuthorBio from "../../../components/AuthorBio";
import siteConfig from "../../../config/site.config";
import { prisma } from "../../../lib/prisma";
import { mapReview } from "../../../lib/mappers";
import { renderContentParagraphs } from "../../../components/RenderContent";
import AffiliateButton from "../../../components/AffiliateButton";
import { JsonLd } from "../../../components/JsonLd";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const reviews = await prisma.review.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return reviews.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dbReview = await prisma.review.findUnique({ where: { slug } });
  if (!dbReview || dbReview.status !== "PUBLISHED") return {};

  return {
    title: dbReview.productName,
    description: dbReview.summary,
    alternates: { canonical: `/review/${slug}` },
    openGraph: {
      title: dbReview.productName,
      description: dbReview.summary,
      url: `/review/${slug}`,
      type: "article",
      images: dbReview.coverImage ? [dbReview.coverImage] : undefined,
    },
  };
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params;
  const dbReview = await prisma.review.findUnique({
    where: { slug },
    include: { author: true },
  });
  if (!dbReview || dbReview.status !== "PUBLISHED") notFound();

  const review = mapReview(dbReview);

  const roundupItem = await prisma.roundupItem.findFirst({
    where: { reviewId: dbReview.id, roundup: { status: "PUBLISHED" } },
    include: { roundup: true },
  });

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Reviews", href: "/reviews" },
    { label: review.productName, href: `/review/${review.slug}` },
  ];

  const fullStars = Math.floor(review.rating);
  const halfStar = review.rating % 1 >= 0.5;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: review.productName,
          description: review.summary,
          image: review.coverImage,
          author: { "@type": "Person", name: review.author.name },
        }}
      />
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{review.productName}</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl text-amber-500">
            {"★".repeat(fullStars)}{halfStar ? "½" : ""}{"☆".repeat(5 - fullStars - (halfStar ? 1 : 0))}
          </span>
          <span className="text-gray-500 text-sm">{review.rating}/5</span>
        </div>
        <p className="mt-4 text-lg text-gray-600 border-l-4 border-amber-200 pl-4 italic">{review.summary}</p>

        {(review.affiliateLinkAmazon || review.affiliateLinkMercadoLivre) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {review.affiliateLinkAmazon && (
              <AffiliateButton label="Ver na Amazon" url={review.affiliateLinkAmazon} />
            )}
            {review.affiliateLinkMercadoLivre && (
              <AffiliateButton label="Ver no Mercado Livre" url={review.affiliateLinkMercadoLivre} />
            )}
          </div>
        )}

        <article className="mt-8 space-y-4 text-gray-700 leading-relaxed">
          {renderContentParagraphs(review.content)}
        </article>
        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-5">
            <h2 className="font-semibold text-green-800 mb-3">Prós</h2>
            <ul className="space-y-2">
              {review.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                  <span className="mt-0.5">✓</span><span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-5">
            <h2 className="font-semibold text-red-800 mb-3">Contras</h2>
            <ul className="space-y-2">
              {review.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="mt-0.5">✗</span><span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {roundupItem && (
          <p className="mt-8 text-sm text-gray-600">
            Faz parte de:{" "}
            <Link href={`/roundup/${roundupItem.roundup.slug}`} className="text-blue-600 hover:underline">
              {roundupItem.roundup.title}
            </Link>
          </p>
        )}
        <AuthorBio author={review.author} />
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
