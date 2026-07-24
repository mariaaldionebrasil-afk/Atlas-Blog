import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Breadcrumb from "../../../components/Breadcrumb";
import AuthorBio from "../../../components/AuthorBio";
import AffiliateButton from "../../../components/AffiliateButton";
import GuideCallout from "../../../components/GuideCallout";
import siteConfig from "../../../config/site.config";
import { prisma } from "../../../lib/prisma";
import { mapPost } from "../../../lib/mappers";
import { renderContentParagraphs } from "../../../components/RenderContent";
import { JsonLd } from "../../../components/JsonLd";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dbPost = await prisma.post.findUnique({ where: { slug } });
  if (!dbPost || dbPost.status !== "PUBLISHED") return {};

  return {
    title: dbPost.title,
    description: dbPost.excerpt,
    alternates: { canonical: `/post/${slug}` },
    openGraph: {
      title: dbPost.title,
      description: dbPost.excerpt,
      url: `/post/${slug}`,
      type: "article",
      images: dbPost.coverImage ? [dbPost.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const dbPost = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      category: true,
      roundup: true,
      comparedReviewA: true,
      comparedReviewB: true,
    },
  });
  if (!dbPost || dbPost.status !== "PUBLISHED") notFound();

  const post = mapPost(dbPost);

  const firstBreak = dbPost.content.indexOf("\n\n");
  const introRaw = firstBreak === -1 ? dbPost.content : dbPost.content.slice(0, firstBreak);
  const restRaw = firstBreak === -1 ? "" : dbPost.content.slice(firstBreak + 2);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/post/${post.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.coverImage,
          datePublished: post.publishedDate,
          author: post.author ? { "@type": "Person", name: post.author.name } : undefined,
        }}
      />
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        {post.category && (
          <span className="mt-4 inline-block text-xs font-medium uppercase tracking-wide text-blue-600">
            {post.category}
          </span>
        )}
        <h1 className="mt-2 text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
        <time className="mt-2 block text-sm text-gray-400">{post.publishedDate}</time>
        <p className="mt-4 text-lg text-gray-600 border-l-4 border-blue-200 pl-4 italic">{post.excerpt}</p>
        <article className="mt-8 space-y-4 text-gray-700 leading-relaxed">
          {renderContentParagraphs(introRaw, "intro-")}
          {dbPost.postType && dbPost.roundup && (
            <GuideCallout roundupTitle={dbPost.roundup.title} roundupSlug={dbPost.roundup.slug} />
          )}
          {restRaw && renderContentParagraphs(restRaw, "rest-")}
        </article>

        {dbPost.postType === "COMPARACAO" && dbPost.comparedReviewA && dbPost.comparedReviewB && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href={`/review/${dbPost.comparedReviewA.slug}`} className="text-blue-600 hover:underline">
              Ver review completo da {dbPost.comparedReviewA.productName} →
            </Link>
            <Link href={`/review/${dbPost.comparedReviewB.slug}`} className="text-blue-600 hover:underline">
              Ver review completo da {dbPost.comparedReviewB.productName} →
            </Link>
          </div>
        )}

        {dbPost.postType === "APOIO" && (dbPost.affiliateLinkAmazon || dbPost.affiliateLinkMercadoLivre) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {dbPost.affiliateLinkAmazon && (
              <AffiliateButton label="Ver na Amazon" url={dbPost.affiliateLinkAmazon} />
            )}
            {dbPost.affiliateLinkMercadoLivre && (
              <AffiliateButton label="Ver no Mercado Livre" url={dbPost.affiliateLinkMercadoLivre} />
            )}
          </div>
        )}

        {post.author && <AuthorBio author={post.author} />}
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
