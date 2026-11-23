// COLLEGE OS - Shared UI Component Toolkit (Modal, Confirm, Toast, Empty State, SVG Charts)

import { getIcon } from './icons.js';
import soundService from './sound.js';
import { escapeHtml } from './utils.js';

export const ui = {
  /**
   * Accessible Modal Dialog
   * @param {Object} options
   * @param {string} options.title - Modal title
   * @param {string} options.contentHtml - HTML body
   * @param {Function} options.onConfirm - Callback on confirm button click (receives modal element)
   * @param {Function} options.onCancel - Callback on cancel
   * @param {string} [options.confirmText='Save']
   * @param {string} [options.cancelText='Cancel']
   * @param {string} [options.confirmClass='btn-primary']
   * @param {string} [options.width='520px']
   * @param {Function} [options.onOpen] - Callback after modal is added to DOM
   */
  modal({
    title,
    contentHtml,
    onConfirm = null,
    onCancel = null,
    confirmText = 'Save',
    cancelText = 'Cancel',
    confirmClass = 'btn-primary',
    width = '520px',
    onOpen = null
  }) {
    // Remove any existing active generic modal
    const existing = document.getElementById('ui-active-modal');
    if (existing) existing.remove();

    const previousFocus = document.activeElement;

    const backdrop = document.createElement('div');
    backdrop.id = 'ui-active-modal';
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'ui-modal-title');

    backdrop.innerHTML = `
      <div class="modal-card" style="max-width: ${width};" role="document">
        <div class="modal-header">
          <h3 id="ui-modal-title" class="modal-title">${escapeHtml(title)}</h3>
          <button class="btn btn-ghost btn-icon btn-xs" id="ui-modal-close-btn" aria-label="Close Dialog">
            ${getIcon('x', 'w-4 h-4')}
          </button>
        </div>
        <div class="modal-body" style="margin-bottom: var(--space-4);">
          ${contentHtml}
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: var(--space-2); border-top: 1px solid var(--os-border); padding-top: var(--space-3);">
          <button class="btn btn-secondary btn-sm" id="ui-modal-cancel-btn">${escapeHtml(cancelText)}</button>
          ${onConfirm ? `<button class="btn ${confirmClass} btn-sm" id="ui-modal-confirm-btn">${escapeHtml(confirmText)}</button>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Trigger open transition
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
    });

    const closeModal = () => {
      backdrop.classList.remove('open');
      setTimeout(() => {
        backdrop.remove();
        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus();
        }
      }, 200);
    };

    // Close on backdrop click (outside card)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        if (onCancel) onCancel();
        closeModal();
      }
    });

    // Close button
    const closeBtn = backdrop.querySelector('#ui-modal-close-btn');
    closeBtn?.addEventListener('click', () => {
      soundService.playClick();
      if (onCancel) onCancel();
      closeModal();
    });

    // Cancel button
    const cancelBtn = backdrop.querySelector('#ui-modal-cancel-btn');
    cancelBtn?.addEventListener('click', () => {
      soundService.playClick();
      if (onCancel) onCancel();
      closeModal();
    });

    // Confirm button
    const confirmBtn = backdrop.querySelector('#ui-modal-confirm-btn');
    confirmBtn?.addEventListener('click', async () => {
      soundService.playClick();
      if (onConfirm) {
        const result = await onConfirm(backdrop);
        if (result !== false) {
          closeModal();
        }
      } else {
        closeModal();
      }
    });

    // Keydown handler: Esc to close, Enter to submit in input fields
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onCancel) onCancel();
        closeModal();
        document.removeEventListener('keydown', handleKeydown);
      } else if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        confirmBtn?.click();
      }
    };
    document.addEventListener('keydown', handleKeydown);

    // Autofocus first input or confirm button
    const firstInput = backdrop.querySelector('input:not([type=hidden]), textarea, select');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 80);
    } else {
      setTimeout(() => confirmBtn?.focus(), 80);
    }

    if (onOpen) {
      onOpen(backdrop);
    }

    return {
      close: closeModal,
      el: backdrop
    };
  },

  /**
   * Confirmation Dialog
   */
  confirm({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    confirmClass = 'btn-danger',
    cancelText = 'Cancel',
    onConfirm = null,
    onCancel = null
  }) {
    return this.modal({
      title,
      width: '420px',
      contentHtml: `<p style="font-size: 0.875rem; color: var(--os-text-muted); line-height: 1.5;">${escapeHtml(message)}</p>`,
      confirmText,
      confirmClass,
      cancelText,
      onConfirm,
      onCancel
    });
  },

  /**
   * Toast Notification with optional Undo action
   */
  toast({
    title,
    message = '',
    type = 'info', // 'info' | 'success' | 'warning' | 'error'
    duration = 3800,
    action = null // { label: 'Undo', onClick: () => {} }
  }) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.style.borderLeft = `4px solid ${
      type === 'success' ? 'var(--os-success)' :
      type === 'error' ? 'var(--os-error)' :
      type === 'warning' ? 'var(--os-warning)' : 'var(--os-accent)'
    }`;

    const iconName = type === 'success' ? 'check-circle' :
                     type === 'error' ? 'alert-triangle' :
                     type === 'warning' ? 'alert-circle' : 'info';

    toastEl.innerHTML = `
      <div style="color: ${type === 'success' ? 'var(--os-success)' : type === 'error' ? 'var(--os-error)' : 'var(--os-accent)'}; flex-shrink: 0; margin-top: 2px;">
        ${getIcon(iconName, 'w-5 h-5')}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 0.8125rem; color: var(--os-text);">${escapeHtml(title)}</div>
        ${message ? `<div style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">${escapeHtml(message)}</div>` : ''}
      </div>
      ${action ? `<button class="btn btn-xs btn-secondary" id="toast-action-btn" style="flex-shrink: 0;">${escapeHtml(action.label)}</button>` : ''}
      <button class="btn btn-ghost btn-icon btn-xs" id="toast-close-btn" style="margin-left: var(--space-1); flex-shrink: 0;" aria-label="Dismiss">
        ${getIcon('x', 'w-3.5 h-3.5')}
      </button>
      <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
    `;

    container.appendChild(toastEl);

    const dismiss = () => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateX(100px) scale(0.9)';
      toastEl.style.transition = 'all 0.25s ease-out';
      setTimeout(() => toastEl.remove(), 250);
    };

    const timer = setTimeout(dismiss, duration);

    toastEl.querySelector('#toast-close-btn')?.addEventListener('click', () => {
      clearTimeout(timer);
      dismiss();
    });

    if (action) {
      toastEl.querySelector('#toast-action-btn')?.addEventListener('click', () => {
        clearTimeout(timer);
        dismiss();
        if (action.onClick) action.onClick();
      });
    }

    return { dismiss };
  },

  /**
   * Standardized Empty State HTML
   */
  emptyState({
    icon = 'inbox',
    title = 'No items found',
    description = '',
    actionText = '',
    actionId = ''
  }) {
    return `
      <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: var(--space-8) var(--space-4); background: var(--os-bg-card); border: 1px dashed var(--os-border); border-radius: var(--radius-xl); margin: var(--space-3) 0;">
        <div style="width: 48px; height: 48px; border-radius: var(--radius-lg); background: var(--os-bg-subtle); display: flex; align-items: center; justify-content: center; color: var(--os-text-muted); margin-bottom: var(--space-3);">
          ${getIcon(icon, 'w-6 h-6')}
        </div>
        <h4 style="font-size: 0.9375rem; font-weight: 700; color: var(--os-text); margin-bottom: var(--space-1);">${escapeHtml(title)}</h4>
        ${description ? `<p style="font-size: 0.75rem; color: var(--os-text-muted); max-width: 320px; margin-bottom: var(--space-4);">${escapeHtml(description)}</p>` : ''}
        ${actionText ? `<button class="btn btn-primary btn-sm" id="${escapeHtml(actionId)}">${getIcon('plus', 'w-3.5 h-3.5')} ${escapeHtml(actionText)}</button>` : ''}
      </div>
    `;
  },

  /**
   * Search and Filter Bar HTML Generator
   */
  searchBar({
    placeholder = 'Search...',
    searchId = 'app-search-input',
    filterOptions = [],
    activeFilter = 'all',
    sortOptions = [],
    activeSort = ''
  }) {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-4);">
        <div class="input-wrapper" style="flex: 1; min-width: 200px; max-width: 380px;">
          <span style="position: absolute; left: 10px; color: var(--os-text-muted); pointer-events: none; display: flex;">
            ${getIcon('search', 'w-4 h-4')}
          </span>
          <input type="text" id="${searchId}" class="form-input" placeholder="${escapeHtml(placeholder)}" style="padding-left: 32px;" />
        </div>

        <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
          ${filterOptions.length > 0 ? `
            <div class="tab-list">
              ${filterOptions.map(f => `
                <button class="tab-btn ${activeFilter === f.id ? 'active' : ''}" data-filter-val="${escapeHtml(f.id)}">
                  ${escapeHtml(f.label)}
                </button>
              `).join('')}
            </div>
          ` : ''}

          ${sortOptions.length > 0 ? `
            <select class="form-select" id="app-sort-select" style="width: auto; padding: 4px 8px; font-size: 0.75rem;">
              ${sortOptions.map(s => `
                <option value="${escapeHtml(s.id)}" ${activeSort === s.id ? 'selected' : ''}>${escapeHtml(s.label)}</option>
              `).join('')}
            </select>
          ` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Pure SVG Charting Library
   */
  chart: {
    /**
     * Responsive SVG Bar Chart
     * @param {Object} options
     * @param {Array<{label: string, value: number, color?: string}>} options.data
     * @param {number} [options.height=160]
     * @param {Function} [options.valueFormatter=v=>v]
     * @param {number} [options.targetLine=null]
     */
    bar({ data = [], height = 160, valueFormatter = v => v, targetLine = null }) {
      if (!data || data.length === 0) {
        return `<div style="text-align: center; padding: 32px; color: var(--os-text-muted); font-size: 0.75rem;">No chart data available</div>`;
      }

      const maxValue = Math.max(...data.map(d => d.value), targetLine || 1, 1);
      const svgWidth = 500;
      const svgHeight = height;
      const paddingLeft = 40;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 28;

      const chartWidth = svgWidth - paddingLeft - paddingRight;
      const chartHeight = svgHeight - paddingTop - paddingBottom;
      const barWidth = Math.min(36, Math.max(12, (chartWidth / data.length) * 0.65));
      const step = chartWidth / data.length;

      let barsSvg = '';
      data.forEach((d, i) => {
        const barHeight = Math.max(2, (d.value / maxValue) * chartHeight);
        const x = paddingLeft + i * step + (step - barWidth) / 2;
        const y = paddingTop + chartHeight - barHeight;
        const color = d.color || 'var(--os-accent)';

        barsSvg += `
          <g class="chart-bar-group" tabindex="0" role="img" aria-label="${escapeHtml(d.label)}: ${valueFormatter(d.value)}">
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${color}" opacity="0.9" style="transition: all 0.2s;">
              <title>${escapeHtml(d.label)}: ${valueFormatter(d.value)}</title>
            </rect>
            <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="9" fill="var(--os-text-muted)" font-family="var(--font-mono)">${valueFormatter(d.value)}</text>
            <text x="${x + barWidth / 2}" y="${svgHeight - 10}" text-anchor="middle" font-size="10" fill="var(--os-text-muted)" font-family="var(--font-body)">${escapeHtml(d.label)}</text>
          </g>
        `;
      });

      // Target reference line
      let targetSvg = '';
      if (targetLine !== null) {
        const targetY = paddingTop + chartHeight - (targetLine / maxValue) * chartHeight;
        targetSvg = `
          <line x1="${paddingLeft}" y1="${targetY}" x2="${svgWidth - paddingRight}" y2="${targetY}" stroke="var(--os-warning)" stroke-dasharray="4,4" stroke-width="1.5" />
          <text x="${svgWidth - paddingRight}" y="${targetY - 4}" text-anchor="end" font-size="9" fill="var(--os-warning)" font-family="var(--font-mono)">Goal: ${valueFormatter(targetLine)}</text>
        `;
      }

      return `
        <div class="svg-chart-container" style="width: 100%; overflow-x: auto;">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; display: block;">
            <!-- Grid baseline -->
            <line x1="${paddingLeft}" y1="${paddingTop + chartHeight}" x2="${svgWidth - paddingRight}" y2="${paddingTop + chartHeight}" stroke="var(--os-border)" stroke-width="1" />
            ${targetSvg}
            ${barsSvg}
          </svg>
        </div>
      `;
    },

    /**
     * Responsive SVG Smooth Line / Area Chart
     */
    line({ data = [], height = 160, strokeColor = 'var(--os-accent)', fillColor = 'rgba(99,102,241,0.15)', valueFormatter = v => v, showDots = true }) {
      if (!data || data.length === 0) {
        return `<div style="text-align: center; padding: 32px; color: var(--os-text-muted); font-size: 0.75rem;">No trend data available</div>`;
      }

      const maxValue = Math.max(...data.map(d => d.value), 1);
      const minValue = Math.min(...data.map(d => d.value), 0);
      const range = Math.max(1, maxValue - minValue);

      const svgWidth = 500;
      const svgHeight = height;
      const paddingLeft = 40;
      const paddingRight = 20;
      const paddingTop = 20;
      const paddingBottom = 28;

      const chartWidth = svgWidth - paddingLeft - paddingRight;
      const chartHeight = svgHeight - paddingTop - paddingBottom;
      const step = chartWidth / Math.max(1, data.length - 1);

      const points = data.map((d, i) => {
        const x = paddingLeft + i * step;
        const y = paddingTop + chartHeight - ((d.value - minValue) / range) * chartHeight;
        return { x, y, ...d };
      });

      // Construct SVG path points
      let pathD = '';
      points.forEach((p, i) => {
        if (i === 0) pathD += `M ${p.x} ${p.y}`;
        else {
          // Smooth curve using cubic bezier control points
          const prev = points[i - 1];
          const cX1 = prev.x + (p.x - prev.x) / 2;
          const cY1 = prev.y;
          const cX2 = prev.x + (p.x - prev.x) / 2;
          const cY2 = p.y;
          pathD += ` C ${cX1} ${cY1}, ${cX2} ${cY2}, ${p.x} ${p.y}`;
        }
      });

      const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

      let dotsSvg = '';
      if (showDots) {
        points.forEach(p => {
          dotsSvg += `
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="${strokeColor}" stroke="#ffffff" stroke-width="2">
              <title>${escapeHtml(p.label)}: ${valueFormatter(p.value)}</title>
            </circle>
            <text x="${p.x}" y="${svgHeight - 10}" text-anchor="middle" font-size="9" fill="var(--os-text-muted)" font-family="var(--font-body)">${escapeHtml(p.label)}</text>
          `;
        });
      }

      return `
        <div class="svg-chart-container" style="width: 100%; overflow-x: auto;">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto; display: block;">
            <!-- Grid baseline -->
            <line x1="${paddingLeft}" y1="${paddingTop + chartHeight}" x2="${svgWidth - paddingRight}" y2="${paddingTop + chartHeight}" stroke="var(--os-border)" stroke-width="1" />
            <!-- Area fill -->
            <path d="${areaD}" fill="${fillColor}" />
            <!-- Line stroke -->
            <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            ${dotsSvg}
          </svg>
        </div>
      `;
    },

    /**
     * SVG Circular Progress Ring
     */
    progressRing({ percent = 0, size = 64, strokeWidth = 6, color = 'var(--os-accent)', label = '' }) {
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const clamped = Math.min(100, Math.max(0, percent));
      const offset = circumference - (clamped / 100) * circumference;

      return `
        <div style="position: relative; width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center;">
          <svg width="${size}" height="${size}" style="transform: rotate(-90deg);">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="var(--os-border)" stroke-width="${strokeWidth}" fill="transparent" />
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${color}" stroke-width="${strokeWidth}" fill="transparent"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" style="transition: stroke-dashoffset 0.6s ease;" />
          </svg>
          <div style="position: absolute; text-align: center; font-size: ${size * 0.22}px; font-weight: 700; font-family: var(--font-mono); color: var(--os-text);">
            ${label || `${Math.round(clamped)}%`}
          </div>
        </div>
      `;
    },

    /**
     * 90-Day Contribution Heatmap (GitHub style)
     * @param {Object} options
     * @param {Object.<string, number>} options.data - Map of 'YYYY-MM-DD' -> count
     * @param {number} [options.days=90]
     */
    heatmap({ data = {}, days = 90 }) {
      const today = new Date();
      const dateList = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        dateList.push({
          date: iso,
          count: data[iso] || 0,
          dayOfWeek: d.getDay()
        });
      }

      // Group into weeks (columns of 7)
      const weeks = [];
      let currentWeek = [];
      // Pad first week with nulls to match start day
      const firstDay = dateList[0].dayOfWeek;
      for (let i = 0; i < firstDay; i++) {
        currentWeek.push(null);
      }

      dateList.forEach(item => {
        currentWeek.push(item);
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }

      const getColor = (count) => {
        if (!count || count <= 0) return 'rgba(255, 255, 255, 0.06)';
        if (count === 1) return '#059669';
        if (count === 2) return '#10b981';
        if (count === 3) return '#34d399';
        return '#6ee7b7';
      };

      return `
        <div class="heatmap-wrapper" style="overflow-x: auto; padding: var(--space-3) 0;">
          <div style="display: inline-flex; gap: 4px; padding: 4px;">
            ${weeks.map(week => `
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${week.map(cell => {
                  if (!cell) return `<div style="width: 12px; height: 12px; opacity: 0;"></div>`;
                  const color = getColor(cell.count);
                  return `
                    <div style="width: 12px; height: 12px; border-radius: 2px; background: ${color}; cursor: pointer; transition: transform 0.15s;"
                      title="${cell.date}: ${cell.count} activities logged"
                      tabindex="0"
                      role="img"
                      aria-label="${cell.date}: ${cell.count} activities logged">
                    </div>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </div>
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px; font-size: 0.6875rem; color: var(--os-text-muted); margin-top: var(--space-2);">
            <span>Less</span>
            <span style="width: 10px; height: 10px; border-radius: 2px; background: rgba(255, 255, 255, 0.06);"></span>
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #059669;"></span>
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #10b981;"></span>
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #34d399;"></span>
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #6ee7b7;"></span>
            <span>More</span>
          </div>
        </div>
      `;
    }
  }
};

export default ui;
