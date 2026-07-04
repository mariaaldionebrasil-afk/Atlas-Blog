import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PostCard from "../../../components/PostCard";
import Breadcrumb from "../../../components/Breadcrumb";
import siteConfig from "../../../config/site.config";
import { prisma } from "../../../lib/prisma";
import { mapPost } from "../../../lib/mappers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const dbPosts = await prisma.post.findMany({
    where: { category: { slug }, status: "PUBLISHED" },
    include: { author: true, category: true },
    orderBy: { publishedDate: "desc" },
  });

  const posts = dbPosts.map(mapPost);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: category.name, href: `/category/${slug}` },
  ];

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-5xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && <p className="mt-2 text-gray-500">{category.description}</p>}
        <p className="mt-1 text-sm text-gray-400">{posts.length} artigo(s)</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {posts.map((post) => <PostCard key={post.slug} post={post} />)}
        </div>
        {posts.length === 0 && <p className="mt-8 text-gray-500">Nenhum artigo nesta categoria ainda.</p>}
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
