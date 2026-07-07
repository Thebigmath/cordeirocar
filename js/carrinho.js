function sanitize(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

function sanitizeInput(str) {
  return String(str).replace(/<[^>]*>/g, '').trim();
}
