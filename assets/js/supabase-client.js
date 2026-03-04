const SUPABASE_URL = 'https://ztbzwckmrtwwcumajezn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9rmDLmyLW_9rteGNAbtngQ_eY7hNiKH';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getUserFingerprint() {
  let fp = localStorage.getItem('menshly_fp');
  if (!fp) {
    fp = 'fp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('menshly_fp', fp);
  }
  return fp;
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}