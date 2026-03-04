const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const auth = event.headers.authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { post } = JSON.parse(event.body);
    const SITE_URL = process.env.SITE_URL || 'https://menshlynews.netlify.app';
    const postUrl = `${SITE_URL}/${post.slug}`;

    const shareUrls = {
      twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      reddit:   `https://www.reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(post.title + ' ' + postUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`
    };

    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a1a12;color:#f5f5f0;margin:0;padding:20px}
  .wrap{max-width:600px;margin:0 auto}
  .header{background:linear-gradient(135deg,#1a3d2e,#2d5a45);border-radius:16px 16px 0 0;padding:32px;text-align:center}
  .logo{font-size:26px;font-weight:bold;color:#d4af37;margin-bottom:8px}
  .badge{display:inline-block;background:#d4af37;color:#0f1f17;padding:5px 16px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
  .body{background:#1a2f22;padding:32px;border:1px solid #2d4a3a;border-top:none}
  .post-title{font-size:22px;font-weight:700;margin:0 0 12px;color:#f5f5f0;line-height:1.3}
  .meta{color:#a8b5a0;font-size:13px;margin-bottom:20px}
  .excerpt{background:#0a1a12;border-left:4px solid #d4af37;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;line-height:1.6;color:#c8d5c0;font-size:14px}
  .section{font-size:15px;font-weight:600;color:#d4af37;margin:24px 0 12px}
  .cta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px}
  .cta-btn{display:block;padding:14px;background:#d4af37;color:#0f1f17;text-align:center;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px}
  .cta-btn.outline{background:transparent;border:2px solid #d4af37;color:#d4af37}
  .share-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px}
  .share-link{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:600;font-size:13px}
  .tw{background:#1a1a2e;border:1px solid #1da1f2;color:#1da1f2}
  .fb{background:#1a1a2e;border:1px solid #4267B2;color:#4267B2}
  .li{background:#1a1a2e;border:1px solid #0077b5;color:#0077b5}
  .rd{background:#1a1a2e;border:1px solid #ff4500;color:#ff4500}
  .wa{background:#1a1a2e;border:1px solid #25d366;color:#25d366}
  .tg{background:#1a1a2e;border:1px solid #0088cc;color:#0088cc}
  .stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px}
  .stat{background:#0a1a12;border-radius:10px;padding:14px;text-align:center}
  .stat-val{font-size:18px;font-weight:700;color:#d4af37;margin-bottom:4px}
  .stat-lbl{font-size:11px;color:#a8b5a0;text-transform:uppercase;letter-spacing:.05em}
  .footer{background:#0f1f17;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border:1px solid #2d4a3a;border-top:none}
  .footer p{color:#5a7a65;font-size:12px;margin:4px 0}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">⚡ Menshlynews</div>
    <span class="badge">🚀 New Post Published</span>
  </div>
  <div class="body">
    <h1 class="post-title">${post.title}</h1>
    <p class="meta">📅 ${new Date(post.published_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})} | 🏷️ ${post.category} | ✍️ Horsnel John</p>
    <div class="excerpt">${post.excerpt || (post.content||'').substring(0,220)}...</div>
    <p class="section">⚡ Quick Actions</p>
    <div class="cta-grid">
      <a href="${postUrl}" class="cta-btn">📖 Read Full Article</a>
      <a href="${SITE_URL}" class="cta-btn outline">🏠 Go to Site</a>
    </div>
    <p class="section">📤 Share With One Click</p>
    <div class="share-grid">
      <a href="${shareUrls.twitter}" class="share-link tw" target="_blank">𝕏 Share on Twitter</a>
      <a href="${shareUrls.facebook}" class="share-link fb" target="_blank">f Share on Facebook</a>
      <a href="${shareUrls.linkedin}" class="share-link li" target="_blank">in Share on LinkedIn</a>
      <a href="${shareUrls.reddit}" class="share-link rd" target="_blank">r Share on Reddit</a>
      <a href="${shareUrls.whatsapp}" class="share-link wa" target="_blank">💬 Share on WhatsApp</a>
      <a href="${shareUrls.telegram}" class="share-link tg" target="_blank">✈️ Share on Telegram</a>
    </div>
    <p class="section">📊 Post Details</p>
    <div class="stats">
      <div class="stat"><div class="stat-val">${post.category}</div><div class="stat-lbl">Category</div></div>
      <div class="stat"><div class="stat-val">${(post.tags||[]).length}</div><div class="stat-lbl">Tags</div></div>
      <div class="stat"><div class="stat-val">~${Math.ceil((post.content||'').length/900)}m</div><div class="stat-lbl">Read Time</div></div>
    </div>
  </div>
  <div class="footer">
    <p><strong style="color:#d4af37">Menshlynews</strong> — AI-Powered Finance Intelligence</p>
    <p>Admin notification | <a href="${SITE_URL}" style="color:#d4af37">${SITE_URL}</a></p>
  </div>
</div>
</body>
</html>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Menshlynews <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL],
        subject: `🚀 New Post: ${post.title}`,
        html: emailHtml
      })
    });

    if (!resendRes.ok) throw new Error(`Resend error: ${await resendRes.text()}`);

    const resendData = await resendRes.json();

    await supabase.from('share_notifications').insert([{
      post_id: post.id,
      sent_to_email: process.env.ADMIN_EMAIL,
      status: 'sent'
    }]);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, resend_id: resendData.id }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};