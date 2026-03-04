like-post.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const { post_id, user_fingerprint } = JSON.parse(event.body);

    if (event.httpMethod === 'POST') {
      const { error } = await supabase.from('post_likes').insert([{ post_id, user_fingerprint }]);
      if (error && error.code !== '23505') throw error;
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'liked' }) };
    }

    if (event.httpMethod === 'DELETE') {
      await supabase.from('post_likes').delete()
        .eq('post_id', post_id).eq('user_fingerprint', user_fingerprint);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, action: 'unliked' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};