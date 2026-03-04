const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SPAM_WORDS = ['viagra', 'casino', 'crypto scam', 'get rich quick'];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { post_id, parent_id, author_name, author_email, content } = JSON.parse(event.body);

    if (!post_id || !author_name || !author_email || !content) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const isSpam = SPAM_WORDS.some(w => content.toLowerCase().includes(w));

    const { data, error } = await supabase.from('comments').insert([{
      post_id,
      parent_id: parent_id || null,
      author_name: author_name.substring(0, 50),
      author_email,
      content: content.substring(0, 2000),
      is_approved: !isSpam,
      author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author_name)}&backgroundColor=b6e3f4`
    }]).select();

    if (error) throw error;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ success: true, comment: data[0], message: isSpam ? 'Pending moderation' : 'Comment posted' })
    };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};