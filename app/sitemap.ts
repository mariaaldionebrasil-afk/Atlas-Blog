import type { MetadataRoute } from 'next';
import { prisma } from '../lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL!;

  const [posts, reviews, roundups] = await Promise.all([
    prisma.post.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, publishedDate: true } }),
    prisma.review.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true } }),
    prisma.roundup.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, createdAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/blog` },
    { url: `${siteUrl}/reviews` },
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/contact` },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/post/${p.slug}`,
    lastModified: p.publishedDate ?? undefined,
  }));

  const reviewRoutes: MetadataRoute.Sitemap = reviews.map((r) => ({
    url: `${siteUrl}/review/${r.slug}`,
  }));

  const roundupRoutes: MetadataRoute.Sitemap = roundups.map((r) => ({
    url: `${siteUrl}/roundup/${r.slug}`,
    lastModified: r.createdAt,
  }));

  return [...staticRoutes, ...postRoutes, ...reviewRoutes, ...roundupRoutes];
}
