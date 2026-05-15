import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendServiceNotification } from '@/lib/email';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return false;
  }

  if (entry.count >= 3) return true;
  entry.count++;
  return false;
}

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  service: z.string().optional().default(''),
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = serviceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, service, message } = result.data;

    // Send notification email to admin via Resend
    await sendServiceNotification({ name, email, service, message });

    return NextResponse.json({
      message: 'Inquiry sent successfully! We\'ll review your project details and get back to you within 24 hours.',
      success: true,
    });
  } catch (error) {
    console.error('Service inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to send your inquiry. Please try again or email us directly at hello@menshlynews.com' },
      { status: 500 }
    );
  }
}
