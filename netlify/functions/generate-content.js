const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const auth = event.headers.authorization;
  if (event.httpMethod === 'POST' && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=AI+finance+online+business&sortBy=relevancy&pageSize=10&language=en&apiKey=${process.env.NEWSAPI_KEY}`
    );
    const newsData = await newsRes.json();

    if (!newsData.articles?.length) throw new Error('No articles from NewsAPI');

    const post = await generateBlogPost(newsData.articles.slice(0, 5));

    const { data, error } = await supabase.from('posts').insert([{
      slug: generateSlug(post.title),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category || 'AI News',
      tags: post.tags || [],
      meta_description: post.metaDescription,
      keywords: post.keywords || [],
      is_published: true,
      published_at: new Date().toISOString()
    }]).select();

    if (error) throw error;

    await fetch(`${process.env.SITE_URL}/.netlify/functions/send-share-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      },
      body: JSON.stringify({ post: data[0] })
    });

    return { statusCode: 200, body: JSON.stringify({ success: true, post: data[0] }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function generateBlogPost(articles) {
  const articlesText = articles.map(a => `• ${a.title}: ${a.description || ''}`).join('\n');

  const prompt = `You are Horsnel John, an AI-powered finance and online business expert writing for Menshlynews.

Write a high-quality blog post based on these trending topics:
${articlesText}

Topics we cover: online business (YouTube, TikTok, blogging), AI tools, forex, crypto, affiliate marketing, coding, wealth creation.

Return ONLY valid JSON with these exact fields:
{
  "title": "Numbered or how-to style title",
  "excerpt": "2-3 sentence hook under 200 chars",
  "content": "800-1000 word article in markdown with ## headings",
  "category": "One of: Online Business, AI News, Finance, Tech Skills, Wealth, Viral",
  "tags": ["tag1", "tag2", "tag3"],
  "metaDescription": "SEO description under 160 chars",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    })
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60) + '-' + Date.now().toString(36);
}