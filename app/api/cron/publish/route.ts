import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const where = { status: 'SCHEDULED' as const, scheduledDate: { lte: now } };

  const [posts, reviews, roundups] = await Promise.all([
    prisma.post.updateMany({ where, data: { status: 'PUBLISHED' } }),
    prisma.review.updateMany({ where, data: { status: 'PUBLISHED' } }),
    prisma.roundup.updateMany({ where, data: { status: 'PUBLISHED' } }),
  ]);

  return NextResponse.json({
    published: posts.count + reviews.count + roundups.count,
    posts: posts.count,
    reviews: reviews.count,
    roundups: roundups.count,
  });
}
