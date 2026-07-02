import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Breadcrumb from "../../../components/Breadcrumb";
import AuthorBio from "../../../components/AuthorBio";
import siteConfig from "../../../config/site.config";
import { prisma } from "../../../lib/prisma";
import { mapPost } from "../../../lib/mappers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const dbPost = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, category: true },
  });
  if (!dbPost) notFound();

  const post = mapPost(dbPost);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/post/${post.slug}` },
  ];

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <span className="mt-4 inline-block text-xs font-medium uppercase tracking-wide text-blue-600">
          {post.category}
        </span>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 leading-tight">{post.title}</h1>
        <time className="mt-2 block text-sm text-gray-400">{post.publishedDate}</time>
        <p className="mt-4 text-lg text-gray-600 border-l-4 border-blue-200 pl-4 italic">{post.excerpt}</p>
        <article className="mt-8 space-y-4 text-gray-700 leading-relaxed">
          {post.content.split("\n\n").map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </article>
        <AuthorBio author={post.author} />
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
