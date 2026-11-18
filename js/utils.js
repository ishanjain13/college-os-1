// COLLEGE OS - Essential Utility Functions

/**
 * Escape HTML characters to prevent XSS
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Fuzzy search match algorithm
 */
export function fuzzyMatch(text, query) {
  if (!text || !query) return false;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return true;

  let qIdx = 0;
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) qIdx++;
  }
  return qIdx === q.length;
}

/**
 * Material 3 Ripple effect on click
 */
export function addRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth, btn.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add('ripple');

  const existingRipple = btn.querySelector('.ripple');
  if (existingRipple) existingRipple.remove();

  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
}

/**
 * Format relative deadline days
 */
export function getDaysLeft(deadlineStr) {
  if (!deadlineStr) return null;
  const diff = new Date(deadlineStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format timestamp nicely
 */
export function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Debounce helper
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
