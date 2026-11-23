// COLLEGE OS - Universal Command Palette (Ctrl+K)
// Keyboard-first quick launcher, fuzzy search, and multi-app command runner

import store, { APP_METADATA } from './state.js';
import windowManager from './windowManager.js';
import { fuzzyMatch, escapeHtml } from './utils.js';
import { getIcon } from './icons.js';
import soundService from './sound.js';
import { toggleTheme } from './theme.js';
import ui from './ui.js';

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

    if (this.input) {
      this.input.setAttribute('role', 'combobox');
      this.input.setAttribute('aria-autocomplete', 'list');
      this.input.setAttribute('aria-expanded', 'false');
      this.input.setAttribute('aria-controls', 'palette-results-list');
    }
    if (this.resultsList) {
      this.resultsList.setAttribute('role', 'listbox');
      this.resultsList.setAttribute('aria-label', 'Command and search suggestions');
    }

    // Global keyboard listener (Ctrl+K / Cmd+K)
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
    this.input?.addEventListener('input', () => {
      this.handleSearch();
    });

    this.input?.addEventListener('keydown', (e) => {
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
    if (this.input) {
      this.input.value = '';
      this.input.setAttribute('aria-expanded', 'true');
    }
    this.selectedIndex = 0;
    this.handleSearch();
    setTimeout(() => this.input?.focus(), 60);
  }

  close() {
    this.isOpen = false;
    this.modal.classList.remove('open');
    if (this.input) {
      this.input.setAttribute('aria-expanded', 'false');
    }
  }

  getAllCommands() {
    const state = store.get();
    const commands = [];

    // 1. Quick Actions
    commands.push({
      id: 'act_quick_capture',
      title: 'Instant Quick Capture',
      subtitle: 'Create a new task, habit, or rapid note',
      category: 'Quick Actions',
      icon: 'plus',
      action: () => {
        const qcModal = document.getElementById('quick-capture-modal');
        if (qcModal) qcModal.classList.add('open');
      }
    });

    commands.push({
      id: 'act_theme',
      title: 'Toggle Light / Dark Theme',
      subtitle: 'Switch between light and dark display mode',
      category: 'Quick Actions',
      icon: 'palette',
      action: () => toggleTheme()
    });

    commands.push({
      id: 'act_focus_pomodoro',
      title: 'Start 25-Min Focus Sprint',
      subtitle: 'Launch Pomodoro timer in Focus & Audio app',
      category: 'Quick Actions',
      icon: 'clock',
      action: () => windowManager.openWindow('focus')
    });

    commands.push({
      id: 'act_ai_coach',
      title: 'Ask AI Study Buddy & Coach',
      subtitle: 'Open cognitive tutor and coursework copilot',
      category: 'Quick Actions',
      icon: 'bot',
      action: () => windowManager.openWindow('ai_buddy')
    });

    commands.push({
      id: 'act_log_workout',
      title: 'Log Workout Session',
      subtitle: 'Record strength sets, volume, and cardio in Fitness',
      category: 'Quick Actions',
      icon: 'activity',
      action: () => windowManager.openWindow('fitness')
    });

    commands.push({
      id: 'act_log_money',
      title: 'Log Expense or Income',
      subtitle: 'Add a new transaction in Campus Finance',
      category: 'Quick Actions',
      icon: 'dollar-sign',
      action: () => windowManager.openWindow('money')
    });

    commands.push({
      id: 'act_journal',
      title: 'Daily Reflection & Mood',
      subtitle: 'Record prompt of the day in Journal',
      category: 'Quick Actions',
      icon: 'feather',
      action: () => windowManager.openWindow('journal')
    });

    commands.push({
      id: 'act_backup',
      title: 'Export Backup (JSON)',
      subtitle: 'Download complete state backup to local drive',
      category: 'Quick Actions',
      icon: 'download',
      action: () => {
        store.exportBackup();
        ui.toast({ title: 'Backup Exported', message: 'College OS JSON saved to your downloads.', type: 'success' });
      }
    });

    // 2. All 18 Apps
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

    // 3. Tasks / Kanban Cards
    (state.kanbanCards || []).slice(0, 10).forEach((task) => {
      commands.push({
        id: `task_${task.id}`,
        title: task.title,
        subtitle: `Task (${task.column}) • Priority: ${task.priority}${task.deadline ? ` • Due: ${task.deadline}` : ''}`,
        category: 'Tasks',
        icon: 'check-square',
        action: () => windowManager.openWindow('planner')
      });
    });

    // 4. Habits
    (state.habits || []).slice(0, 8).forEach((habit) => {
      commands.push({
        id: `habit_${habit.id}`,
        title: habit.name,
        subtitle: `Habit (${habit.category || 'General'}) • ${habit.currentStreak || 0}-day streak`,
        category: 'Habits',
        icon: 'check-circle',
        action: () => windowManager.openWindow('habits')
      });
    });

    // 5. Goals
    (state.goals || []).slice(0, 6).forEach((goal) => {
      commands.push({
        id: `goal_${goal.id}`,
        title: goal.title,
        subtitle: `Goal (${goal.category || 'Academic'}) • ${goal.current}/${goal.target} ${goal.unit || ''}`,
        category: 'Goals',
        icon: 'target',
        action: () => windowManager.openWindow('goals')
      });
    });

    // 6. Notes
    (state.notes || []).slice(0, 8).forEach((note) => {
      commands.push({
        id: `note_${note.id}`,
        title: note.title,
        subtitle: `Note (${note.subject || 'General'})${note.tags?.length ? ` • ${note.tags.join(', ')}` : ''}`,
        category: 'Notes',
        icon: 'book-open',
        action: () => windowManager.openWindow('notes')
      });
    });

    // 7. Campus Events
    (state.campus?.events || []).slice(0, 6).forEach((evt) => {
      commands.push({
        id: `campus_${evt.id}`,
        title: evt.title,
        subtitle: `Campus Event • ${evt.date} (${evt.location || 'Campus'})`,
        category: 'Campus',
        icon: 'calendar',
        action: () => windowManager.openWindow('campus')
      });
    });

    return commands;
  }

  handleSearch() {
    const q = this.input ? this.input.value.trim() : '';
    const all = this.getAllCommands();

    if (!q) {
      this.filteredItems = all.slice(0, 12);
    } else {
      this.filteredItems = all.filter((item) =>
        fuzzyMatch(item.title, q) ||
        fuzzyMatch(item.subtitle, q) ||
        fuzzyMatch(item.category, q)
      ).slice(0, 14);
    }

    this.selectedIndex = 0;
    this.renderResults();
  }

  moveSelection(delta) {
    if (this.filteredItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex + delta + this.filteredItems.length) % this.filteredItems.length;
    this.renderResults();

    const selectedEl = this.resultsList?.querySelector('.palette-item.selected');
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
    if (!this.resultsList) return;

    if (this.input) {
      this.input.setAttribute('aria-activedescendant', `palette-opt-${this.selectedIndex}`);
    }

    if (this.filteredItems.length === 0) {
      this.resultsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--os-text-muted); font-size: 0.8125rem;">
          No matching commands, apps, or records found.
        </div>
      `;
      return;
    }

    let html = '';
    let currentCat = '';

    this.filteredItems.forEach((item, index) => {
      if (item.category !== currentCat) {
        currentCat = item.category;
        html += `<div class="palette-group-title" role="presentation">${escapeHtml(currentCat)}</div>`;
      }

      const isSelected = index === this.selectedIndex;
      html += `
        <div
          class="palette-item ${isSelected ? 'selected' : ''}"
          id="palette-opt-${index}"
          role="option"
          aria-selected="${isSelected}"
          data-index="${index}"
        >
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
