import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PostCard from "../../components/PostCard";
import Pagination from "../../components/Pagination";
import siteConfig from "../../config/site.config";
import { prisma } from "../../lib/prisma";
import { mapPost } from "../../lib/mappers";

const POSTS_PER_PAGE = 4;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [total, dbPosts] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      include: { author: true, category: true },
      orderBy: { publishedDate: "desc" },
      skip: (currentPage - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
  ]);

  const posts = dbPosts.map(mapPost);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-12 w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
        <h2 className="text-sm text-gray-500 font-normal mb-8">Todos os artigos</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
