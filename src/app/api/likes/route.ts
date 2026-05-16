import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/data';

// GET /api/likes — Get like counts for all posts
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fingerprint = url.searchParams.get('fp') || '';

    // Get all PostMeta records
    const metaRecords = await db.postMeta.findMany({
      select: {
        id: true,
        likes: true,
      },
    });

    // Build a map of postId -> DB likes
    const dbLikesMap: Record<string, number> = {};
    for (const record of metaRecords) {
      dbLikesMap[record.id] = record.likes;
    }

    // If fingerprint provided, check which posts this user has liked
    let likedPostIds: Set<string> = new Set();
    if (fingerprint) {
      const userLikes = await db.like.findMany({
        where: { fingerprint },
        select: { postId: true },
      });
      likedPostIds = new Set(userLikes.map((l) => l.postId));
    }

    const likeData: Record<string, { count: number; liked: boolean }> = {};
    
    // Return data for all posts from data.ts, using DB likes when available
    for (const post of posts) {
      const dbLikes = dbLikesMap[post.id];
      likeData[post.id] = {
        // Use DB likes if available (includes user likes), otherwise fallback to data.ts likes
        count: dbLikes !== undefined ? dbLikes : post.likes,
        liked: likedPostIds.has(post.id),
      };
    }

    return NextResponse.json(likeData);
  } catch (error) {
    console.error('Error fetching likes:', error);
    // Fallback: return data.ts likes without DB data (for Vercel where SQLite might fail)
    const fallbackData: Record<string, { count: number; liked: boolean }> = {};
    for (const post of posts) {
      fallbackData[post.id] = { count: post.likes, liked: false };
    }
    return NextResponse.json(fallbackData);
  }
}

// POST /api/likes — Toggle like for a post
export async function POST(req: NextRequest) {
  try {
    const { postId, fingerprint } = await req.json();

    if (!postId || !fingerprint) {
      return NextResponse.json(
        { error: 'postId and fingerprint are required' },
        { status: 400 }
      );
    }

    // Ensure PostMeta record exists for this post
    const existingMeta = await db.postMeta.findUnique({
      where: { id: postId },
    });

    if (!existingMeta) {
      // Find the post in data.ts to get base likes count
      const post = posts.find((p) => p.id === postId);
      const baseLikes = post?.likes ?? 0;
      await db.postMeta.create({
        data: { id: postId, likes: baseLikes, views: 0 },
      });
    }

    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        postId_fingerprint: { postId, fingerprint },
      },
    });

    if (existingLike) {
      // Unlike: remove the like record and decrement count
      await db.like.delete({
        where: { id: existingLike.id },
      });
      const updatedMeta = await db.postMeta.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });
      return NextResponse.json({
        liked: false,
        count: Math.max(0, updatedMeta.likes),
      });
    } else {
      // Like: create the like record and increment count
      await db.like.create({
        data: { postId, fingerprint },
      });
      const updatedMeta = await db.postMeta.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json({
        liked: true,
        count: updatedMeta.likes,
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
