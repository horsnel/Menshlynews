const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
    if (!newsData.articles?.length) throw new Error('No articles found');

    const post = await generateBlogPost(newsData.articles.slice(0, 5));

    // MATCHING YOUR SQL SCHEMA EXACTLY
    const { data, error } = await supabase.from('posts').insert([{
      slug: generateSlug(post.title),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category || 'Finance',
      tags: post.tags || [],
      author_name: 'Horsnel John', // Matches your SQL default
      tldr: post.tldr || [],       // Added to match your SQL
      takeaways: post.takeaways || [], // Added to match your SQL
      meta_description: post.metaDescription,
      keywords: post.keywords || [],
      is_published: true,          // SET TO TRUE so the Policy allows it to be seen
      published_at: new Date().toISOString()
    }]).select();

    if (error) {
      console.error("SUPABASE ERROR:", JSON.stringify(error, null, 2));
      throw error;
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, post: data[0] }) };
  } catch (error) {
    console.error("CRASH:", error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

async function generateBlogPost(articles) {
  const articlesText = articles.map(a => `• ${a.title}: ${a.description || ''}`).join('\n');

  const prompt = `You are Horsnel John, a finance expert. Write a blog post based on: ${articlesText}.
  Return ONLY JSON with: title, excerpt, content (markdown), category, tags (array), tldr (array of 3 points), takeaways (array of 3 points), metaDescription, keywords (array).`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').substring(0, 60) + '-' + Date.now().toString(36);
}
