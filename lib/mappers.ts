import type { Post, Review, Author, Category } from "./types";

type PrismaAuthor = { slug: string; name: string; bio: string; avatar: string | null };
type PrismaCategory = { slug: string; name: string; description: string | null };

type PrismaPost = {
  slug: string; title: string; excerpt: string; content: string;
  publishedDate: Date; coverImage: string | null;
  author: PrismaAuthor; category: PrismaCategory;
};

type PrismaReview = {
  slug: string; productName: string; rating: number; summary: string;
  content: string; pros: string[]; cons: string[]; coverImage: string | null;
  author: PrismaAuthor;
};

export function mapPost(p: PrismaPost): Post {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category.slug,
    publishedDate: p.publishedDate.toISOString().split("T")[0],
    coverImage: p.coverImage ?? undefined,
    author: mapAuthor(p.author),
  };
}

export function mapReview(r: PrismaReview): Review {
  return {
    slug: r.slug,
    productName: r.productName,
    rating: r.rating,
    summary: r.summary,
    content: r.content,
    pros: r.pros,
    cons: r.cons,
    coverImage: r.coverImage ?? undefined,
    author: mapAuthor(r.author),
  };
}

export function mapAuthor(a: PrismaAuthor): Author {
  return {
    slug: a.slug,
    name: a.name,
    bio: a.bio,
    avatar: a.avatar ?? undefined,
  };
}

export function mapCategory(c: PrismaCategory): Category {
  return {
    slug: c.slug,
    name: c.name,
    description: c.description ?? undefined,
  };
}
