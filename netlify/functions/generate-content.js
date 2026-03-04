const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // 1. Log the start so you see it in Netlify
  console.log("Function triggered at:", new Date().toISOString());

  const auth = event.headers.authorization;
  if (event.httpMethod === 'POST' && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Unauthorized attempt: check your CRON_SECRET");
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=AI+finance+online+business&sortBy=relevancy&pageSize=10&language=en&apiKey=${process.env.NEWSAPI_KEY}`
    );
    const newsData = await newsRes.json();

    if (!newsData.articles?.length) {
      throw new Error('No articles returned from NewsAPI. Check your API key or query.');
    }

    // 2. Pass articles to generator
    console.log("Fetching content from Groq...");
    const post = await generateBlogPost(newsData.articles.slice(0, 5));

    // 3. Insert into Supabase
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

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    console.log("Post saved successfully:", data[0].slug);

    // Optional notification call (wrapped in try/catch so it doesn't kill the main process)
    try {
      if (process.env.SITE_URL) {
        await fetch(`${process.env.SITE_URL}/.netlify/functions/send-share-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRON_SECRET}`
          },
          body: JSON.stringify({ post: data[0] })
        });
      }
    } catch (notifyError) {
      console.warn("Notification failed, but post was saved.", notifyError.message);
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ success: true, slug: data[0].slug }) 
    };

  } catch (error) {
    console.error("FUNCTION CRASHED:", error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};

async function generateBlogPost(articles) {
  const articlesText = articles.map(a => `• ${a.title}: ${a.description || ''}`).join('\n');

  const prompt = `You are Horsnel John, an AI-powered finance and online business expert writing for Menshlynews.
Write a high-quality blog post based on these trending topics:
${articlesText}

Topics: online business, AI tools, forex, crypto, affiliate marketing, coding, wealth creation.
Return ONLY valid JSON.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // UPDATED MODEL
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" } // Forces Groq to return clean JSON
    })
  });

  const data = await res.json();
  
  if (data.error) {
    throw new Error(`Groq API Error: ${data.error.message}`);
  }

  const text = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(text);
}

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60) + '-' + Date.now().toString(36);
}
