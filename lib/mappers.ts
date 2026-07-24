import type { Post, Review, Author, Category } from "./types";

type PrismaAuthor = { slug: string; name: string; bio: string; avatar: string | null };
type PrismaCategory = { slug: string; name: string; description: string | null };

type PrismaPost = {
  slug: string; title: string; excerpt: string; content: string;
  publishedDate: Date | null; coverImage: string | null;
  author: PrismaAuthor | null; category: PrismaCategory | null;
};

type PrismaReview = {
  slug: string; productName: string; rating: number | null; summary: string;
  content: string; pros: string[]; cons: string[]; coverImage: string | null;
  author: PrismaAuthor | null;
  affiliateLinkAmazon: string | null; affiliateLinkMercadoLivre: string | null;
};

// Post/Review passados aqui já foram filtrados por status: 'PUBLISHED' pelo
// caller — author/categoria/rating só ficam nulos em esqueletos DRAFT criados
// pela Etapa 3 do Documento 9 (Fila de Criação os preenche antes de publicar).
export function mapPost(p: PrismaPost): Post {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category?.slug,
    publishedDate: p.publishedDate ? p.publishedDate.toISOString().split("T")[0] : "",
    coverImage: p.coverImage ?? undefined,
    author: p.author ? mapAuthor(p.author) : undefined,
  };
}

export function mapReview(r: PrismaReview): Review {
  return {
    slug: r.slug,
    productName: r.productName,
    rating: r.rating!,
    summary: r.summary,
    content: r.content,
    pros: r.pros,
    cons: r.cons,
    coverImage: r.coverImage ?? undefined,
    author: mapAuthor(r.author!),
    affiliateLinkAmazon: r.affiliateLinkAmazon ?? undefined,
    affiliateLinkMercadoLivre: r.affiliateLinkMercadoLivre ?? undefined,
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
