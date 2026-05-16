import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts as staticPosts, categories as staticCategories } from '@/lib/data';

export async function GET() {
  try {
    const dbPosts = await db.post.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // If DB has posts, use them
    if (dbPosts.length > 0) {
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
    }

    // DB is empty — fall back to static data
    const fallbackCategories = staticCategories.map((c) => ({
      name: c.name,
      count: c.count,
      color: c.color,
    }));

    return NextResponse.json({ posts: staticPosts, categories: fallbackCategories });
  } catch (error) {
    console.error('Error fetching posts from DB, falling back to static data:', error);

    // DB completely unavailable — fall back to static data
    const fallbackCategories = staticCategories.map((c) => ({
      name: c.name,
      count: c.count,
      color: c.color,
    }));

    return NextResponse.json({ posts: staticPosts, categories: fallbackCategories });
  }
}
