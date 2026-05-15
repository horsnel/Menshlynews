import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const dbPosts = await db.post.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Transform DB posts to match the Post interface used in the frontend
    const posts = dbPosts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      category: p.category,
      image: p.image,
      author: p.author,
      date: p.date,
      readTime: p.readTime,
      content: p.content,
      featured: p.featured,
      likes: p.likes,
      shares: p.shares,
      tags: p.tags ? p.tags.split(',').filter(Boolean) : [],
    }));

    // Compute categories from DB
    const categoryCounts = dbPosts.reduce(
      (acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      color: 'bg-[#166f4f]/10 text-[#1c7352]',
    }));

    return NextResponse.json({ posts, categories });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ posts: [], categories: [] }, { status: 500 });
  }
}
