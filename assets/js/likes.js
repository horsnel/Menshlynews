document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.like-button').forEach(btn => {
    const postId = btn.dataset.postId;
    if (!postId) return;
    initLikeButton(postId, btn);
  });
});

async function initLikeButton(postId, btn) {
  const fp = getUserFingerprint();

  const { count } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  btn.querySelector('.like-count').textContent = count || 0;

  try {
    const { data } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_fingerprint', fp)
      .single();
    if (data) btn.classList.add('liked');
  } catch (_) {}

  btn.addEventListener('click', async () => {
    if (btn.classList.contains('liked')) {
      await supabase.from('post_likes').delete()
        .eq('post_id', postId).eq('user_fingerprint', fp);
      btn.classList.remove('liked');
      btn.querySelector('.like-count').textContent =
        Math.max(0, parseInt(btn.querySelector('.like-count').textContent) - 1);
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_fingerprint: fp }]);
      btn.classList.add('liked');
      btn.querySelector('.like-count').textContent =
        parseInt(btn.querySelector('.like-count').textContent) + 1;
      showToast('❤️ Post liked!');
    }
  });
}