import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import PostCard from "../components/PostCard";
import ReviewCard from "../components/ReviewCard";
import CategoryGrid from "../components/CategoryGrid";
import AboutTeaser from "../components/AboutTeaser";
import siteConfig from "../config/site.config";
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { mapPost, mapReview, mapAuthor } from "../lib/mappers";
import { JsonLd } from "../components/JsonLd";

const HOMEPAGE_DESCRIPTION =
  "Cursos gratuitos de bancos como Bradesco e Santander, dicas de carreira e crescimento pessoal. Conteúdo direto ao ponto, sem enrolação.";

export const metadata: Metadata = {
  title: siteConfig.siteName,
  description: HOMEPAGE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.siteName,
    description: HOMEPAGE_DESCRIPTION,
    url: "/",
    type: "website",
  },
};

export default async function HomePage() {
  const [dbPosts, dbReviews, categories, dbAuthors] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { publishedDate: "desc" },
      take: 4,
    }),
    prisma.review.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.author.findMany(),
  ]);

  const recentPosts = dbPosts.map(mapPost);
  const reviews = dbReviews.map(mapReview);
  const authors = dbAuthors.map(mapAuthor);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.siteName,
          url: process.env.SITE_URL,
        }}
      />
      <Header config={siteConfig} />
      <main className="flex-1">
        <HeroSection
          title="Cursos Gratuitos e Dicas para Crescer na Carreira e na Vida"
          subtitle="Conteúdo gratuito e direto ao ponto sobre cursos, oportunidades e desenvolvimento pessoal — pra você aproveitar o que os grandes bancos e instituições oferecem sem gastar nada."
        />

        <div className="mx-auto max-w-5xl px-4 py-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Artigos recentes</h2>
              <Link href="/blog" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {recentPosts.map((post) => <PostCard key={post.slug} post={post} />)}
            </div>
          </section>

          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews em destaque</h2>
              <Link href="/reviews" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {reviews.map((review) => <ReviewCard key={review.slug} review={review} />)}
            </div>
          </section>

          {categories.length > 0 && (
            <CategoryGrid
              categories={categories.map((c) => ({ ...c, description: c.description ?? undefined }))}
            />
          )}
          <AboutTeaser siteName={siteConfig.siteName} authors={authors} />
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
