const { createClient } = require('@supabase/supabase-js');

// 1. PRE-FLIGHT SAFETY CHECK
// This prevents the "Silent 500" by checking your Netlify variables immediately.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("CRITICAL ERROR: Supabase environment variables are MISSING in Netlify settings.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.handler = async (event) => {
  console.log("--- [START] Automation Triggered ---");

  // 2. AUTHENTICATION CHECK
  const authHeader = event.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (event.httpMethod === 'POST' && authHeader !== expectedAuth) {
    console.error("AUTH FAILURE: The Bearer token from Cron-job.org does not match Netlify's CRON_SECRET.");
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    // 3. FETCH NEWS
    console.log("Step 1: Fetching trending AI/Finance news...");
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=AI+finance+online+business&sortBy=relevancy&pageSize=10&language=en&apiKey=${process.env.NEWSAPI_KEY}`
    );
    const newsData = await newsRes.json();

    if (!newsData.articles?.length) {
      throw new Error('NewsAPI returned 0 articles. Check your API key or query terms.');
    }

    // 4. GENERATE CONTENT VIA GROQ
    console.log("Step 2: Sending data to Groq (Model: llama-3.3-70b-versatile)...");
    const post = await generateBlogPost(newsData.articles.slice(0, 5));
    console.log("Step 3: AI Generation Success. Title:", post.title);

    // 5. INSERT INTO SUPABASE
    console.log("Step 4: Attempting Supabase Insert...");
    const { data, error } = await supabase.from('posts').insert([{
      slug: generateSlug(post.title),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category || 'AI News',
      tags: post.tags || [],
      meta_description: post.metaDescription, // Ensure this matches your DB column exactly!
      keywords: post.keywords || [],
      is_published: true,
      published_at: new Date().toISOString()
    }]).select();

    if (error) {
      // If Supabase rejects it, this prints the EXACT reason (e.g., "duplicate slug" or "missing column")
      console.error("SUPABASE REJECTION DETAILS:", JSON.stringify(error, null, 2));
      throw new Error(`Database Error: ${error.message}`);
    }

    console.log("--- [SUCCESS] Post Published! ---");
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

  const prompt = `You are Horsnel John, a finance and business expert. Write a high-quality blog post in Markdown based on these topics:
${articlesText}

Return ONLY a valid JSON object with these fields: title, excerpt, content, category, tags (array), metaDescription, keywords (array).`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // The current active high-end model
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" } // Forces Groq to return clean JSON (no intro text)
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(`Groq API Error: ${data.error.message}`);

  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60) + '-' + Date.now().toString(36);
}
