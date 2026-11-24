// COLLEGE OS - Shared Motion System & Micro-Interactions Toolkit
// Pure vanilla Web Animations, requestAnimationFrame, FLIP, and accessibility helpers

/**
 * Check if reduced motion is requested either via OS preference or College OS Settings
 */
export function isReducedMotion() {
  if (typeof window === 'undefined') return false;
  const osSetting = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const appSetting = document.documentElement.getAttribute('data-reduce-motion') === 'true';
  return Boolean(osSetting || appSetting);
}

/**
 * Accessible Focus Trapping for Modal Dialogs & Palettes
 * @param {HTMLElement} containerEl - The modal or dialog element
 * @param {Function} [onEscape] - Callback when Escape key is pressed
 * @returns {Function} cleanup - Function to release trap and restore focus
 */
export function trapFocus(containerEl, onEscape = null) {
  if (!containerEl) return () => {};

  const previousFocus = document.activeElement;
  const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const getFocusable = () => {
    return Array.from(containerEl.querySelectorAll(focusableSelector))
      .filter(el => el.offsetParent !== null && !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (onEscape) {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
      }
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = getFocusable();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: backwards
      if (document.activeElement === firstEl || !containerEl.contains(document.activeElement)) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      // Tab: forwards
      if (document.activeElement === lastEl || !containerEl.contains(document.activeElement)) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown, true);

  // Autofocus first element or container
  requestAnimationFrame(() => {
    const focusable = getFocusable();
    if (focusable.length > 0) {
      const autoFocusTarget = containerEl.querySelector('[autofocus]') || focusable[0];
      autoFocusTarget.focus();
    } else {
      containerEl.focus();
    }
  });

  return function cleanup() {
    document.removeEventListener('keydown', handleKeyDown, true);
    if (previousFocus && typeof previousFocus.focus === 'function' && document.body.contains(previousFocus)) {
      try {
        previousFocus.focus();
      } catch (e) {}
    }
  };
}

/**
 * Material 3 Tactile Ripple Effect
 * Works with both direct event listeners and delegated click listeners
 */
export function addRipple(e, customTarget = null) {
  if (isReducedMotion()) return;

  const btn = customTarget || (e.currentTarget && e.currentTarget.closest ? e.currentTarget.closest('.btn, .dock-item, .ripple-surface') : null) || (e.target && e.target.closest ? e.target.closest('.btn, .dock-item, .ripple-surface') : null);
  if (!btn) return;

  const rect = btn.getBoundingClientRect();
  const circle = document.createElement('span');
  const diameter = Math.max(btn.clientWidth || rect.width, btn.clientHeight || rect.height);
  const radius = diameter / 2;

  const clientX = e.clientX !== undefined ? e.clientX : rect.left + rect.width / 2;
  const clientY = e.clientY !== undefined ? e.clientY : rect.top + rect.height / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${clientX - rect.left - radius}px`;
  circle.style.top = `${clientY - rect.top - radius}px`;
  circle.className = 'ripple';

  // Ensure button has relative positioning for ripple containment
  const position = window.getComputedStyle(btn).position;
  if (position === 'static') {
    btn.style.position = 'relative';
  }

  const existing = btn.querySelector('.ripple');
  if (existing) existing.remove();

  btn.appendChild(circle);
  setTimeout(() => {
    if (circle && circle.parentNode === btn) {
      circle.remove();
    }
  }, 600);
}

/**
 * Animated Number Counter (XP, Streaks, Stat percentages)
 * Interpolates smoothly from previous value to new value
 * @param {HTMLElement} element - Target DOM element
 * @param {number} startVal - Value to start from
 * @param {number} endVal - Value to end at
 * @param {Object} [options]
 * @param {number} [options.duration=700] - Duration in ms
 * @param {string} [options.suffix=''] - Suffix like '%', ' XP', etc.
 * @param {string} [options.prefix=''] - Prefix like '$', '+', etc.
 * @param {boolean} [options.formatLocale=true] - Use toLocaleString()
 * @param {Function} [options.onComplete] - Callback on finish
 */
export function animateNumber(element, startVal, endVal, options = {}) {
  if (!element) return;

  const {
    duration = 650,
    suffix = '',
    prefix = '',
    formatLocale = true,
    onComplete = null
  } = options;

  const start = Number(startVal) || 0;
  const end = Number(endVal) || 0;

  if (start === end || isReducedMotion()) {
    const formatted = formatLocale ? end.toLocaleString() : String(end);
    element.textContent = `${prefix}${formatted}${suffix}`;
    if (onComplete) onComplete();
    return;
  }

  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const easedProgress = easeOutCubic(progress);

    const currentVal = Math.round(start + (end - start) * easedProgress);
    const formatted = formatLocale ? currentVal.toLocaleString() : String(currentVal);
    element.textContent = `${prefix}${formatted}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      const finalFormatted = formatLocale ? end.toLocaleString() : String(end);
      element.textContent = `${prefix}${finalFormatted}${suffix}`;
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(update);
}

/**
 * Animated Progress Bar / SVG Ring
 */
export function animateProgressRing(circleEl, fromPercent, toPercent, duration = 600) {
  if (!circleEl) return;
  const radius = parseFloat(circleEl.getAttribute('r')) || 26;
  const circumference = 2 * Math.PI * radius;

  if (isReducedMotion()) {
    const clamped = Math.min(100, Math.max(0, toPercent));
    const offset = circumference - (clamped / 100) * circumference;
    circleEl.style.strokeDashoffset = `${offset}`;
    return;
  }

  const startTime = performance.now();
  const startOffset = circumference - (Math.min(100, Math.max(0, fromPercent)) / 100) * circumference;
  const targetOffset = circumference - (Math.min(100, Math.max(0, toPercent)) / 100) * circumference;

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeOutQuad(progress);

    const currentOffset = startOffset + (targetOffset - startOffset) * eased;
    circleEl.style.strokeDashoffset = `${currentOffset}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * FLIP (First, Last, Invert, Play) Animation Helper
 * For 60fps reordering of list cards, Kanban columns, and habit items
 */
export function flipAnimate(elements, updateCallback, options = {}) {
  const { duration = 250, easing = 'cubic-bezier(0.2, 0, 0, 1)' } = options;

  if (isReducedMotion() || !elements || elements.length === 0) {
    updateCallback();
    return;
  }

  // 1. FIRST: Record bounding rects
  const firstRects = new Map();
  elements.forEach(el => {
    if (el) firstRects.set(el, el.getBoundingClientRect());
  });

  // 2. Execute DOM mutation
  updateCallback();

  // 3. LAST & INVERT: Measure new positions & invert with transform
  requestAnimationFrame(() => {
    elements.forEach(el => {
      if (!el) return;
      const first = firstRects.get(el);
      if (!first) return;

      const last = el.getBoundingClientRect();
      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;

      if (deltaX !== 0 || deltaY !== 0) {
        // Invert
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = 'transform 0s';

        // Play
        requestAnimationFrame(() => {
          el.style.transform = '';
          el.style.transition = `transform ${duration}ms ${easing}`;
        });
      }
    });
  });
}
