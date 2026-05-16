import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts as staticPosts, categories as staticCategories } from '@/lib/data';

export async function GET() {
  try {
    // Subscriber count from DB (only thing that needs DB)
    const subscriberCount = await db.subscriber.count({ where: { isActive: true } });

    return NextResponse.json({
      subscribers: subscriberCount,
      posts: staticPosts.length,
      categories: staticCategories.length,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      subscribers: 0,
      posts: staticPosts.length,
      categories: staticCategories.length,
    });
  }
}
