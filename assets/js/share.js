if (typeof copyToClipboard === 'undefined') {
  window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 Link copied!'))
      .catch(() => {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        showToast('📋 Link copied!');
      });
  };
}