import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import PostCard from "../components/PostCard";
import ReviewCard from "../components/ReviewCard";
import CategoryGrid from "../components/CategoryGrid";
import AboutTeaser from "../components/AboutTeaser";
import { posts, reviews } from "../lib/mock-data";
import siteConfig from "../config/site.config";
import Link from "next/link";

export default function HomePage() {
  const recentPosts = [...posts]
    .sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1))
    .slice(0, 4);

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1">
        {/* Bloco 1: Hero */}
        <HeroSection
          title={siteConfig.siteName}
          subtitle="Conteúdo informacional, reviews e guias práticos para o seu dia a dia."
        />

        <div className="mx-auto max-w-5xl px-4 py-12">
          {/* Bloco 2: Artigos recentes */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Artigos recentes</h2>
              <Link href="/blog" className="text-sm text-blue-600 hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {recentPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>

          {/* Bloco 3: Reviews em destaque */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews em destaque</h2>
              <Link href="/reviews" className="text-sm text-blue-600 hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {reviews.map((review) => (
                <ReviewCard key={review.slug} review={review} />
              ))}
            </div>
          </section>

          {/* Bloco 4: Navegação por categorias */}
          <CategoryGrid categories={siteConfig.categories} />

          {/* Bloco 5: Teaser "Quem somos" */}
          <AboutTeaser siteName={siteConfig.siteName} />
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
