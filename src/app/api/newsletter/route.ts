import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return false;
  }

  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.enum(['popup', 'footer', 'sidebar']).default('popup'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email, source } = result.data;

    // Check if already subscribed
    const existing = await db.subscriber.findUnique({ where: { email } });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ message: 'Already subscribed!', alreadySubscribed: true });
      }
      // Re-activate if previously unsubscribed
      await db.subscriber.update({
        where: { email },
        data: { isActive: true, source },
      });
      return NextResponse.json({ message: 'Welcome back!', reactivated: true });
    }

    await db.subscriber.create({
      data: { email, source },
    });

    return NextResponse.json({ message: 'Successfully subscribed!', success: true });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await db.subscriber.count({ where: { isActive: true } });
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching subscriber count:', error);
    return NextResponse.json({ count: 0 });
  }
}
