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
import { mapPost, mapReview } from "../lib/mappers";
import { JsonLd } from "../components/JsonLd";

export const metadata: Metadata = {
  title: siteConfig.siteName,
  description: "Conteúdo informacional, reviews e guias práticos para o seu dia a dia.",
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.siteName,
    description: "Conteúdo informacional, reviews e guias práticos para o seu dia a dia.",
    url: "/",
    type: "website",
  },
};

export default async function HomePage() {
  const [dbPosts, dbReviews] = await Promise.all([
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
  ]);

  const recentPosts = dbPosts.map(mapPost);
  const reviews = dbReviews.map(mapReview);

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
          title={siteConfig.siteName}
          subtitle="Conteúdo informacional, reviews e guias práticos para o seu dia a dia."
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

          <CategoryGrid categories={siteConfig.categories} />
          <AboutTeaser siteName={siteConfig.siteName} />
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
