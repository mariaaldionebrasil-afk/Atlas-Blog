import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PostCard from "../../components/PostCard";
import Pagination from "../../components/Pagination";
import { posts } from "../../lib/mock-data";
import siteConfig from "../../config/site.config";

const POSTS_PER_PAGE = 4;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const sorted = [...posts].sort((a, b) =>
    a.publishedDate < b.publishedDate ? 1 : -1
  );
  const paginated = sorted.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-12 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>
        <div className="grid gap-6 sm:grid-cols-2">
          {paginated.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/blog"
        />
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
