import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// The "from" address for all outgoing emails.
// On Resend free tier, use onboarding@resend.dev.
// Once you verify your custom domain in Resend, change this to e.g. "Menshly Wire <hello@menshlynews.com>"
const FROM_EMAIL = 'Menshly Wire <onboarding@resend.dev>';

// The admin email that receives notifications
const ADMIN_EMAIL = 'hello@menshlynews.com';

interface SendContactEmailParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SendServiceEmailParams {
  name: string;
  email: string;
  service: string;
  message: string;
}

interface SendWelcomeEmailParams {
  email: string;
}

export async function sendContactNotification({ name, email, subject, message }: SendContactEmailParams) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [ADMIN_EMAIL],
    subject: `Contact Form: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #166f4f, #1c7352); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">New Contact Message</h1>
          <p style="color: #76bf9f; margin: 8px 0 0;">Menshly Wire</p>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #121212; width: 100px;">Name:</td>
              <td style="padding: 8px 0; color: #475569;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #121212;">Email:</td>
              <td style="padding: 8px 0; color: #475569;"><a href="mailto:${escapeHtml(email)}" style="color: #166f4f;">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #121212;">Subject:</td>
              <td style="padding: 8px 0; color: #475569;">${escapeHtml(subject)}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #121212; font-weight: 600; margin: 0 0 8px;">Message:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; color: #475569; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">This message was submitted via the Menshly Wire contact form on ${new Date().toLocaleString()}.</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('Resend contact email error:', error);
    throw new Error('Failed to send contact notification email');
  }

  return data;
}

export async function sendServiceNotification({ name, email, service, message }: SendServiceEmailParams) {
  const serviceLabel = service || 'Not specified';

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [ADMIN_EMAIL],
    subject: `Service Inquiry: ${serviceLabel} — from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #166f4f, #1c7352); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">New Service Inquiry</h1>
          <p style="color: #76bf9f; margin: 8px 0 0;">Menshly Wire Services</p>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #121212; width: 100px;">Name:</td>
              <td style="padding: 8px 0; color: #475569;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #121212;">Email:</td>
              <td style="padding: 8px 0; color: #475569;"><a href="mailto:${escapeHtml(email)}" style="color: #166f4f;">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #121212;">Service:</td>
              <td style="padding: 8px 0;">
                <span style="background: #166f4f; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px;">${escapeHtml(serviceLabel)}</span>
              </td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #121212; font-weight: 600; margin: 0 0 8px;">Project Details:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; color: #475569; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message)}</div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">This inquiry was submitted via the Menshly Wire services page on ${new Date().toLocaleString()}.</p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('Resend service email error:', error);
    throw new Error('Failed to send service notification email');
  }

  return data;
}

export async function sendWelcomeEmail({ email }: SendWelcomeEmailParams) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: 'Welcome to Menshly Wire! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #166f4f, #1c7352); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px;">Welcome to Menshly Wire!</h1>
          <p style="color: #76bf9f; margin: 8px 0 0; font-size: 16px;">Where AI Meets Revenue</p>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #121212; font-size: 16px; line-height: 1.6;">Hey there!</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Thanks for subscribing to <strong style="color: #166f4f;">Menshly Wire</strong>. You've just joined a community of 50,000+ smart readers who get weekly AI-powered wealth-building strategies delivered straight to their inbox.
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Here's what you can expect from us:
          </p>
          <ul style="color: #475569; font-size: 15px; line-height: 1.8; padding-left: 20px;">
            <li>Weekly AI money-making strategies and insights</li>
            <li>Investment analysis backed by real data</li>
            <li>Step-by-step guides for AI-powered side hustles</li>
            <li>Exclusive tips not found on the blog</li>
            <li>Zero spam — unsubscribe anytime</li>
          </ul>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://menshlynews.com" style="background: linear-gradient(135deg, #166f4f, #1c7352); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Read Latest Articles</a>
          </div>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Your first newsletter issue is on its way. In the meantime, feel free to explore our latest articles on the blog.
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Cheers,<br />
            <strong style="color: #166f4f;">Horsnel John</strong><br />
            <span style="color: #94a3b8; font-size: 13px;">Founder & Editor-in-Chief, Menshly Wire</span>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            Menshly Wire — Where AI Meets Revenue<br />
            You're receiving this because you subscribed at menshlynews.com
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error('Resend welcome email error:', error);
    // Don't throw — a failed welcome email shouldn't block the subscription
    return null;
  }

  return data;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
