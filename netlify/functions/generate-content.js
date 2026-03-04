const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// API Keys (already set in your Netlify env vars)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    console.log('🚀 Starting content generation...');
    
    // Step 1: Fetch news
    const news = await fetchNews();
    console.log('📰 Fetched', news.length, 'articles');
    
    // Step 2: Generate content with GROQ
    const generated = await generateWithGroq(news);
    console.log('✍️ Content generated:', generated.title);
    
    // Step 3: Structure and save post
    const post = createPostData(generated, news[0]);
    
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single();
    
    if (error) throw error;
    console.log('💾 Post saved:', data.id);
    
    // Step 4: Trigger rebuild
    const rebuildStatus = await triggerRebuild();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        post: { id: data.id, title: data.title, slug: data.slug },
        rebuildStatus
      })
    };
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};

// Fetch tech/business news
async function fetchNews() {
  const cats = ['technology', 'business'];
  const cat = cats[Math.floor(Math.random() * cats.length)];
  
  const res = await fetch(
    `https://newsapi.org/v2/top-headlines?category=${cat}&language=en&pageSize=3&apiKey=${NEWSAPI_KEY}`
  );
  
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.message);
  return data.articles;
}

// Generate blog post with GROQ
async function generateWithGroq(articles) {
  const context = articles.map(a => `${a.title}: ${a.description}`).join('\n');
  
  const prompt = `Write a tech/finance blog post based on this news. Return JSON:

${context}

Format:
{
  "title": "60 char max",
  "slug": "url-slug",
  "content": "Markdown, 800 words, ## sections",
  "excerpt": "150 char hook",
  "category": "Tech and Finance",
  "tags": ["AI","Tech","Finance"],
  "tldr": ["3 key points"],
  "takeaways": ["3 insights"],
  "meta_description": "160 char SEO",
  "keywords": ["5","keywords"]
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {role: 'system', content: 'Return valid JSON only'},
        {role: 'user', content: prompt}
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });
  
  const data = await res.json();
  const text = data.choices[0].message.content;
  
  // Extract JSON
  const json = text.match(/```json\n([\s\S]*?)\n```/)?.[1] 
            || text.match(/```\n([\s\S]*?)\n```/)?.[1] 
            || text;
            
  return JSON.parse(json.trim());
}

// Create post object
function createPostData(gen, source) {
  const now = new Date();
  
  return {
    slug: `${gen.slug}-${Date.now().toString(36)}`,
    title: gen.title,
    content: gen.content,
    excerpt: gen.excerpt,
    category: gen.category || 'Tech and Finance',
    tags: gen.tags || ['Tech', 'Finance'],
    author_name: 'Horsnel John',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HorsnelJohn&backgroundColor=b6e3f4',
    featured_image: source?.urlToImage || null,
    youtube_embed: null,
    dailymotion_embed: null,
    tldr: gen.tldr || [],
    takeaways: gen.takeaways || [],
    meta_description: gen.meta_description,
    keywords: gen.keywords || [],
    view_count: 0,
    like_count: 0,
    is_published: true,
    published_at: now.toISOString()
  };
}

// Trigger Netlify rebuild
async function triggerRebuild() {
  const hook = process.env.BUILD_HOOK_URL;
  if (!hook) return 'no_hook';
  
  try {
    const res = await fetch(hook, {method: 'POST'});
    return res.ok ? 'triggered' : 'failed';
  } catch (e) {
    return 'error';
  }
}
