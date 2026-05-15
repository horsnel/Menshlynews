import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactNotification } from '@/lib/email';

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

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
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
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Send notification email to admin via Resend
    await sendContactNotification({ name, email, subject, message });

    return NextResponse.json({
      message: 'Message sent successfully! We\'ll get back to you within 24-48 hours.',
      success: true,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send your message. Please try again or email us directly at hello@menshlynews.com' },
      { status: 500 }
    );
  }
}
