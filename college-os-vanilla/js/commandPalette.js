// COLLEGE OS - Universal Command Palette (Ctrl+K)

import store, { APP_METADATA } from './state.js';
import windowManager from './windowManager.js';
import { fuzzyMatch, escapeHtml } from './utils.js';
import { getIcon } from './icons.js';
import soundService from './sound.js';
import { toggleTheme } from './theme.js';

class CommandPalette {
  constructor() {
    this.isOpen = false;
    this.modal = null;
    this.input = null;
    this.resultsList = null;
    this.selectedIndex = 0;
    this.filteredItems = [];
  }

  init() {
    this.modal = document.getElementById('command-palette-modal');
    if (!this.modal) return;

    this.input = this.modal.querySelector('#palette-search-input');
    this.resultsList = this.modal.querySelector('#palette-results-list');

    // Global keyboard listener
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Input events
    this.input.addEventListener('input', () => {
      this.handleSearch();
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.moveSelection(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.moveSelection(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.executeSelected();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    soundService.playClick();
    this.isOpen = true;
    this.modal.classList.add('open');
    this.input.value = '';
    this.selectedIndex = 0;
    this.handleSearch();
    setTimeout(() => this.input.focus(), 60);
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('open');
  }

  getAllCommands() {
    const state = store.get();
    const commands = [];

    // 1. All 18 Apps
    Object.values(APP_METADATA).forEach((app) => {
      commands.push({
        id: `app_${app.id}`,
        title: app.title,
        subtitle: `Launch ${app.title}`,
        category: 'Applications',
        icon: app.icon,
        action: () => windowManager.openWindow(app.id)
      });
    });

    // 2. Quick Actions
    commands.push({
      id: 'act_theme',
      title: 'Toggle Light / Dark Theme',
      subtitle: 'Switch between light and dark display mode',
      category: 'Actions',
      icon: 'palette',
      action: () => toggleTheme()
    });

    commands.push({
      id: 'act_quick_capture',
      title: 'Instant Quick Capture',
      subtitle: 'Create a new task, goal, habit, or note',
      category: 'Actions',
      icon: 'plus',
      action: () => {
        const qcModal = document.getElementById('quick-capture-modal');
        if (qcModal) qcModal.classList.add('open');
      }
    });

    // 3. Tasks / Kanban
    (state.kanbanCards || []).slice(0, 8).forEach((task) => {
      commands.push({
        id: `task_${task.id}`,
        title: task.title,
        subtitle: `Task (${task.column}) • Priority: ${task.priority}`,
        category: 'Tasks',
        icon: 'calendar',
        action: () => windowManager.openWindow('planner')
      });
    });

    // 4. Notes
    (state.notes || []).slice(0, 6).forEach((note) => {
      commands.push({
        id: `note_${note.id}`,
        title: note.title,
        subtitle: `Subject: ${note.subject} • Note`,
        category: 'Notes',
        icon: 'book-open',
        action: () => windowManager.openWindow('notes')
      });
    });

    return commands;
  }

  handleSearch() {
    const q = this.input.value.trim();
    const all = this.getAllCommands();

    if (!q) {
      this.filteredItems = all.slice(0, 10);
    } else {
      this.filteredItems = all.filter((item) =>
        fuzzyMatch(item.title, q) || fuzzyMatch(item.subtitle, q) || fuzzyMatch(item.category, q)
      ).slice(0, 12);
    }

    this.selectedIndex = 0;
    this.renderResults();
  }

  moveSelection(delta) {
    if (this.filteredItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex + delta + this.filteredItems.length) % this.filteredItems.length;
    this.renderResults();

    const selectedEl = this.resultsList.querySelector('.palette-item.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  executeSelected() {
    const selected = this.filteredItems[this.selectedIndex];
    if (selected && selected.action) {
      this.close();
      selected.action();
    }
  }

  renderResults() {
    if (this.filteredItems.length === 0) {
      this.resultsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--os-text-muted); font-size: 0.8125rem;">
          No matching commands found.
        </div>
      `;
      return;
    }

    let html = '';
    let currentCat = '';

    this.filteredItems.forEach((item, index) => {
      if (item.category !== currentCat) {
        currentCat = item.category;
        html += `<div class="palette-group-title">${escapeHtml(currentCat)}</div>`;
      }

      const isSelected = index === this.selectedIndex;
      html += `
        <div class="palette-item ${isSelected ? 'selected' : ''}" data-index="${index}">
          <div class="palette-item-left">
            <div class="palette-item-icon" style="background: rgba(255,255,255,0.06); color: var(--os-accent);">
              ${getIcon(item.icon || 'sparkles', 'w-4 h-4')}
            </div>
            <div class="palette-item-text">
              <div class="palette-item-title">${escapeHtml(item.title)}</div>
              <div class="palette-item-subtitle">${escapeHtml(item.subtitle)}</div>
            </div>
          </div>
          <div style="font-size: 0.6875rem; color: var(--os-text-subtle);">Jump ↵</div>
        </div>
      `;
    });

    this.resultsList.innerHTML = html;

    // Attach click listeners to rows
    this.resultsList.querySelectorAll('.palette-item').forEach((row) => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.getAttribute('data-index'), 10);
        this.selectedIndex = idx;
        this.executeSelected();
      });
    });
  }
}

export const commandPalette = new CommandPalette();
export default commandPalette;
