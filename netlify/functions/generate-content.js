const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Fetch news
    const newsRes = await fetch(
      `https://newsapi.org/v2/top-headlines?category=technology&language=en&pageSize=3&apiKey=${NEWSAPI_KEY}`
    );
    const newsData = await newsRes.json();
    const articles = newsData.articles.slice(0, 3);
    
    // Generate with GROQ (UPDATED MODEL)
    const prompt = `Write a tech/finance blog post based on these headlines. Return JSON only:

${articles.map(a => `- ${a.title}: ${a.description}`).join('\n')}

Format: {"title":"...","slug":"...","content":"markdown...","excerpt":"...","category":"Tech and Finance","tags":["..."],"tldr":["..."],"takeaways":["..."],"meta_description":"...","keywords":["..."]}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-70b-versatile', // ✅ UPDATED
        messages: [{role: 'user', content: prompt}],
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    
    const groqData = await groqRes.json();
    const text = groqData.choices[0].message.content;
    const json = text.match(/\{[\s\S]*\}/)[0];
    const gen = JSON.parse(json);
    
    // Save to Supabase
    const post = {
      slug: `${gen.slug}-${Date.now().toString(36)}`,
      title: gen.title,
      content: gen.content,
      excerpt: gen.excerpt,
      category: gen.category,
      tags: gen.tags,
      author_name: 'Horsnel John',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HorsnelJohn&backgroundColor=b6e3f4',
      featured_image: articles[0]?.urlToImage || null,
      tldr: gen.tldr,
      takeaways: gen.takeaways,
      meta_description: gen.meta_description,
      keywords: gen.keywords,
      is_published: true,
      published_at: new Date().toISOString()
    };
    
    const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(post)
    });
    
    const saved = await saveRes.json();
    
    // Trigger rebuild
    if (process.env.BUILD_HOOK_URL) {
      await fetch(process.env.BUILD_HOOK_URL, {method: 'POST'});
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({success: true, post: {id: saved[0].id, title: saved[0].title}})
    };
    
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({success: false, error: err.message})
    };
  }
};
