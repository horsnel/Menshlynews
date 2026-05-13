import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/likes — Get like counts for all posts (or specific posts)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fingerprint = url.searchParams.get('fp') || '';

    const posts = await db.post.findMany({
      select: {
        id: true,
        likes: true,
      },
    });

    // If fingerprint provided, check which posts this user has liked
    let likedPostIds: string[] = [];
    if (fingerprint) {
      const userLikes = await db.like.findMany({
        where: { fingerprint },
        select: { postId: true },
      });
      likedPostIds = userLikes.map((l) => l.postId);
    }

    const likeData: Record<string, { count: number; liked: boolean }> = {};
    for (const post of posts) {
      likeData[post.id] = {
        count: post.likes,
        liked: likedPostIds.includes(post.id),
      };
    }

    return NextResponse.json(likeData);
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
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
      const updatedPost = await db.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });
      return NextResponse.json({
        liked: false,
        count: Math.max(0, updatedPost.likes),
      });
    } else {
      // Like: create the like record and increment count
      await db.like.create({
        data: { postId, fingerprint },
      });
      const updatedPost = await db.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json({
        liked: true,
        count: updatedPost.likes,
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
