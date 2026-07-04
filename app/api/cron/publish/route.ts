import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await prisma.post.updateMany({
    where: {
      status: 'SCHEDULED',
      scheduledDate: { lte: new Date() },
    },
    data: { status: 'PUBLISHED' },
  });

  return NextResponse.json({ published: result.count });
}
