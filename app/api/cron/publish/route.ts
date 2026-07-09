import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureMetaTokensFresh } from '@/lib/refreshMetaToken';
import { reframeImage } from '@/lib/reframeImage';
import { generateSocialCaption } from '@/lib/generateSocialCaption';
import { publishToFacebook } from '@/lib/publishToFacebook';
import { publishToInstagram } from '@/lib/publishToInstagram';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 60;

type Kind = 'post' | 'review' | 'roundup';

type Item = {
  kind: Kind;
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage: string | null;
};

type ContentRef = { postId?: string; reviewId?: string; roundupId?: string };

function refFor(item: Item): ContentRef {
  if (item.kind === 'post') return { postId: item.id };
  if (item.kind === 'review') return { reviewId: item.id };
  return { roundupId: item.id };
}

async function logSocialResult(
  ref: ContentRef,
  network: 'FACEBOOK' | 'INSTAGRAM',
  status: 'SUCCESS' | 'FAILED',
  externalId: string | null,
  errorMessage?: string
) {
  await prisma.socialPublication.create({
    data: {
      ...ref,
      network,
      status,
      externalId: externalId ?? undefined,
      errorMessage: errorMessage ?? undefined,
    },
  });
}

async function publishItemToSocialNetworks(item: Item) {
  const ref = refFor(item);
  const articleUrl = `${process.env.SITE_URL}/${item.kind}/${item.slug}`;

  if (!item.coverImage) {
    await logSocialResult(ref, 'FACEBOOK', 'FAILED', null, 'Imagem de capa ausente');
    await logSocialResult(ref, 'INSTAGRAM', 'FAILED', null, 'Imagem de capa ausente');
    return;
  }

  const supabaseAdmin = createAdminClient();

  let facebookImage: string | null = null;
  try {
    facebookImage = await reframeImage(supabaseAdmin, item.coverImage, '1.91:1', `${item.kind}-${item.slug}-fb`);
  } catch (err) {
    console.error('Falha ao reenquadrar imagem para Facebook:', err);
  }

  let instagramImage: string | null = null;
  try {
    instagramImage = await reframeImage(supabaseAdmin, item.coverImage, '1:1', `${item.kind}-${item.slug}-ig`);
  } catch (err) {
    console.error('Falha ao reenquadrar imagem para Instagram:', err);
  }

  try {
    if (!facebookImage) throw new Error('Imagem reenquadrada para Facebook indisponível.');
    const caption = await generateSocialCaption(item.title, item.summary, 'facebook');
    const postId = await publishToFacebook(facebookImage, caption, articleUrl);
    await logSocialResult(ref, 'FACEBOOK', 'SUCCESS', postId);
  } catch (err) {
    console.error('Falha ao publicar no Facebook:', err);
    await logSocialResult(ref, 'FACEBOOK', 'FAILED', null, String(err));
  }

  try {
    if (!instagramImage) throw new Error('Imagem reenquadrada para Instagram indisponível.');
    const caption = await generateSocialCaption(item.title, item.summary, 'instagram');
    const mediaId = await publishToInstagram(instagramImage, caption);
    await logSocialResult(ref, 'INSTAGRAM', 'SUCCESS', mediaId);
  } catch (err) {
    console.error('Falha ao publicar no Instagram:', err);
    await logSocialResult(ref, 'INSTAGRAM', 'FAILED', null, String(err));
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureMetaTokensFresh().catch((err) => console.error('Falha ao renovar tokens Meta:', err));

  const now = new Date();
  const where = { status: 'SCHEDULED' as const, scheduledDate: { lte: now } };

  const [duePosts, dueReviews, dueRoundups] = await Promise.all([
    prisma.post.findMany({
      where,
      select: { id: true, slug: true, title: true, excerpt: true, coverImage: true },
    }),
    prisma.review.findMany({
      where,
      select: { id: true, slug: true, productName: true, summary: true, coverImage: true },
    }),
    prisma.roundup.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        snippet: true,
        items: {
          orderBy: { position: 'asc' },
          take: 1,
          select: { review: { select: { coverImage: true } } },
        },
      },
    }),
  ]);

  const items: Item[] = [
    ...duePosts.map((p) => ({
      kind: 'post' as const,
      id: p.id,
      slug: p.slug,
      title: p.title,
      summary: p.excerpt,
      coverImage: p.coverImage,
    })),
    ...dueReviews.map((r) => ({
      kind: 'review' as const,
      id: r.id,
      slug: r.slug,
      title: r.productName,
      summary: r.summary,
      coverImage: r.coverImage,
    })),
    ...dueRoundups.map((r) => ({
      kind: 'roundup' as const,
      id: r.id,
      slug: r.slug,
      title: r.title,
      summary: r.snippet,
      coverImage: r.items[0]?.review.coverImage ?? null,
    })),
  ];

  const [posts, reviews, roundups] = await Promise.all([
    prisma.post.updateMany({ where, data: { status: 'PUBLISHED' } }),
    prisma.review.updateMany({ where, data: { status: 'PUBLISHED' } }),
    prisma.roundup.updateMany({ where, data: { status: 'PUBLISHED' } }),
  ]);

  for (const item of items) {
    await publishItemToSocialNetworks(item);
  }

  return NextResponse.json({
    published: posts.count + reviews.count + roundups.count,
    posts: posts.count,
    reviews: reviews.count,
    roundups: roundups.count,
  });
}
