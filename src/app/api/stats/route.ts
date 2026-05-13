import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [subscriberCount, postCount] = await Promise.all([
      db.subscriber.count({ where: { isActive: true } }),
      db.post.count(),
    ]);

    return NextResponse.json({
      subscribers: subscriberCount,
      posts: postCount,
      categories: 6,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ subscribers: 0, posts: 0, categories: 6 });
  }
}
