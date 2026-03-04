const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const params = event.queryStringParameters || {};
    const category = params.category;
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '12');

    let query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ posts: posts || [], page: page })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};