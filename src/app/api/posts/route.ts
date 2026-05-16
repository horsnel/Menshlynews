import { NextResponse } from 'next/server';
import { posts as staticPosts, categories as staticCategories } from '@/lib/data';

export async function GET() {
  // Articles always come from data.ts — no DB call needed
  const categories = staticCategories.map((c) => ({
    name: c.name,
    count: c.count,
    color: c.color,
  }));

  return NextResponse.json({ posts: staticPosts, categories });
}
