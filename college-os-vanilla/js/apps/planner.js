// COLLEGE OS - App: Daily Planner & Kanban Board (Drag-and-Drop, Subtasks, Time Estimates & Labels)

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const plannerApp = {
  id: 'planner',
  title: 'Daily Planner & Kanban',
  icon: 'calendar',
  searchQuery: '',
  selectedPriority: 'All',

  render() {
    const state = store.get();
    const columns = ['To Do', 'In Progress', 'Done'];

    const filteredCards = (state.kanbanCards || []).filter(c => {
      if (this.selectedPriority !== 'All' && c.priority !== this.selectedPriority.toLowerCase()) return false;
      if (this.searchQuery && !c.title.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
      return true;
    });

    const totalTasks = (state.kanbanCards || []).length;
    const doneTasks = (state.kanbanCards || []).filter(c => c.column === 'Done').length;
    const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Daily Planner &amp; Kanban Execution</h2>
            <p>High-agency task pipelines. Drag, prioritize, and crush friction.</p>
          </div>
          <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--os-text-muted);">
              Completed: <strong style="color: var(--os-success);">${doneTasks} / ${totalTasks}</strong> (${completionPct}%)
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-clear-done">
              Clear Completed
            </button>
            <button class="btn btn-primary btn-sm" id="btn-add-kanban">
              ${getIcon('plus', 'w-3.5 h-3.5')} New Task Card
            </button>
          </div>
        </div>

        <!-- Filter bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
          <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; flex: 1;">
            <div class="tab-list">
              ${['All', 'High', 'Medium', 'Low'].map(p => `
                <button class="tab-btn ${this.selectedPriority === p ? 'active' : ''}" data-kanban-priority="${p}">
                  ${p}
                </button>
              `).join('')}
            </div>
            <div class="input-wrapper" style="width: 200px;">
              <input type="text" id="kanban-search-input" class="form-input" placeholder="Search tasks..." value="${escapeHtml(this.searchQuery)}" style="padding: 4px 8px; font-size: 0.75rem;" />
            </div>
          </div>
        </div>

        <!-- Kanban 3-Column Board -->
        <div class="kanban-board" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); flex: 1; min-height: 0; overflow-y: auto;">
          ${columns.map(col => {
            const cards = filteredCards.filter(c => c.column === col);
            return `
              <div class="kanban-col" data-col="${col}" style="background: var(--os-bg-subtle); border: 1px solid var(--os-border); border-radius: var(--radius-xl); padding: var(--space-3); display: flex; flex-direction: column; gap: var(--space-3); min-height: 250px;">
                <div class="kanban-col-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: var(--space-2); border-bottom: 1px solid var(--os-border);">
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="font-weight: 700; font-size: 0.875rem; color: var(--os-text);">${col}</span>
                    <span class="badge badge-primary">${cards.length}</span>
                  </div>
                  <button class="btn btn-ghost btn-xs" data-quick-add-col="${col}" title="Add task to ${col}">
                    ${getIcon('plus', 'w-3 h-3')}
                  </button>
                </div>

                <div class="kanban-card-dropzone" data-drop-col="${col}" style="display: flex; flex-direction: column; gap: var(--space-2-5); flex: 1; min-height: 120px;">
                  ${cards.map(card => {
                    const subtasks = card.subtasks || [];
                    const subCompleted = subtasks.filter(s => s.completed).length;
                    const isDone = card.column === 'Done';

                    return `
                      <div class="kanban-card-item card card-interactive" draggable="true" data-card-id="${card.id}" style="padding: var(--space-3); border-radius: var(--radius-lg); border-left: 3px solid ${card.priority === 'high' ? 'var(--os-error)' : card.priority === 'medium' ? 'var(--os-warning)' : 'var(--os-accent)'};">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-2);">
                          <span style="font-weight: 700; font-size: 0.8125rem; color: ${isDone ? 'var(--os-text-muted)' : 'var(--os-text)'}; text-decoration: ${isDone ? 'line-through' : 'none'}; cursor: pointer;" data-edit-card="${card.id}">
                            ${escapeHtml(card.title)}
                          </span>
                          <span class="badge ${card.priority === 'high' ? 'badge-error' : card.priority === 'medium' ? 'badge-warning' : 'badge-primary'}" style="font-size: 0.625rem; text-transform: uppercase;">
                            ${card.priority}
                          </span>
                        </div>

                        ${(card.labels || []).length > 0 ? `
                          <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: var(--space-1);">
                            ${card.labels.map(l => `
                              <span style="font-size: 0.625rem; font-family: var(--font-mono); color: var(--os-text-subtle); background: var(--os-bg-input); padding: 2px 6px; border-radius: 4px;">${escapeHtml(l)}</span>
                            `).join('')}
                          </div>
                        ` : ''}

                        <!-- Subtasks Progress Indicator -->
                        ${subtasks.length > 0 ? `
                          <div style="margin-top: var(--space-2); font-size: 0.6875rem; color: var(--os-text-muted); display: flex; align-items: center; justify-content: space-between;">
                            <span>${getIcon('check-square', 'w-3 h-3')} ${subCompleted} of ${subtasks.length} subtasks</span>
                            <span style="font-family: var(--font-mono);">${Math.round((subCompleted / subtasks.length) * 100)}%</span>
                          </div>
                          <div class="progress-bar-container" style="height: 3px; margin-top: 2px;">
                            <div class="progress-bar-fill" style="width: ${(subCompleted / subtasks.length) * 100}%;"></div>
                          </div>
                        ` : ''}

                        <!-- Footer -->
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border-subtle); padding-top: 6px; margin-top: var(--space-2); font-size: 0.6875rem;">
                          <span style="color: var(--os-text-subtle); font-family: var(--font-mono);">
                            ${card.deadline ? `Due ${card.deadline}` : 'No date'}
                          </span>
                          <div style="display: flex; gap: 4px; align-items: center;">
                            ${col !== 'To Do' ? `
                              <button class="btn btn-ghost btn-xs" data-move-col="${card.id}:${col === 'Done' ? 'In Progress' : 'To Do'}" title="Move left">←</button>
                            ` : ''}
                            ${col !== 'Done' ? `
                              <button class="btn btn-ghost btn-xs" data-move-col="${card.id}:${col === 'To Do' ? 'In Progress' : 'Done'}" title="Move right">→</button>
                            ` : `
                              <span style="color: var(--os-success); font-weight: 700; font-size: 0.6875rem;">✓</span>
                            `}
                            <button class="btn btn-ghost btn-xs" data-edit-card="${card.id}" title="Edit Task">${getIcon('edit-2', 'w-3 h-3')}</button>
                            <button class="btn btn-ghost btn-xs" data-delete-card="${card.id}" title="Delete Task">×</button>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}

                  ${cards.length === 0 ? `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; border: 1px dashed var(--os-border); border-radius: var(--radius-md); padding: var(--space-4); color: var(--os-text-subtle); font-size: 0.75rem;">
                      <span>Empty column</span>
                      <button class="btn btn-ghost btn-xs" data-quick-add-col="${col}" style="margin-top: 4px;">+ Add Task</button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  init(container) {
    // Priority filter
    container.querySelectorAll('[data-kanban-priority]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.selectedPriority = btn.getAttribute('data-kanban-priority');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Search input
    const searchInput = container.querySelector('#kanban-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      container.innerHTML = this.render();
      this.init(container);
      const newSearch = container.querySelector('#kanban-search-input');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
      }
    });

    // Move task button (accessible column navigation)
    container.querySelectorAll('[data-move-col]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const [cardId, targetCol] = btn.getAttribute('data-move-col').split(':');
        this.moveTask(cardId, targetCol, e.clientX, e.clientY, container);
      });
    });

    // Drag-and-drop support
    let draggedCardId = null;

    container.querySelectorAll('.kanban-card-item[draggable]').forEach(cardEl => {
      cardEl.addEventListener('dragstart', (e) => {
        draggedCardId = cardEl.getAttribute('data-card-id');
        e.dataTransfer.setData('text/plain', draggedCardId);
        cardEl.style.opacity = '0.4';
      });

      cardEl.addEventListener('dragend', () => {
        cardEl.style.opacity = '1';
        draggedCardId = null;
      });
    });

    container.querySelectorAll('.kanban-card-dropzone').forEach(dropzone => {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.background = 'var(--os-bg-hover)';
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.style.background = 'transparent';
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.background = 'transparent';
        const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
        const targetCol = dropzone.getAttribute('data-drop-col');
        if (cardId && targetCol) {
          this.moveTask(cardId, targetCol, e.clientX, e.clientY, container);
        }
      });
    });

    // Delete card
    container.querySelectorAll('[data-delete-card]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cardId = btn.getAttribute('data-delete-card');
        soundService.playClick();
        store.setKanbanCards(prev => prev.filter(c => c.id !== cardId));
        ui.toast({ title: 'Task Deleted', message: 'Task removed from board.', type: 'info' });
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Edit card
    container.querySelectorAll('[data-edit-card]').forEach(el => {
      el.addEventListener('click', () => {
        const cardId = el.getAttribute('data-edit-card');
        const card = store.get().kanbanCards.find(c => c.id === cardId);
        if (card) this.openTaskModal(card, container);
      });
    });

    // Quick add inline
    container.querySelectorAll('[data-quick-add-col]').forEach(btn => {
      btn.addEventListener('click', () => {
        const col = btn.getAttribute('data-quick-add-col');
        this.openTaskModal({ column: col }, container);
      });
    });

    // Clear completed tasks
    const clearDoneBtn = container.querySelector('#btn-clear-done');
    clearDoneBtn?.addEventListener('click', () => {
      ui.confirm({
        title: 'Clear Completed Tasks?',
        message: 'All tasks currently in the "Done" column will be archived and removed from your board.',
        confirmText: 'Clear Completed',
        confirmClass: 'btn-danger',
        onConfirm: () => {
          store.setKanbanCards(prev => prev.filter(c => c.column !== 'Done'));
          ui.toast({ title: 'Tasks Cleared', message: 'Done column cleared.', type: 'info' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Add task button
    const addBtn = container.querySelector('#btn-add-kanban');
    addBtn?.addEventListener('click', () => this.openTaskModal(null, container));
  },

  moveTask(cardId, targetCol, x, y, container) {
    const card = store.get().kanbanCards.find(c => c.id === cardId);
    if (!card || card.column === targetCol) return;

    const prevCol = card.column;

    store.setKanbanCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return { ...c, column: targetCol };
      }
      return c;
    }));

    soundService.playClick();

    if (targetCol === 'Done' && prevCol !== 'Done') {
      logActivity({
        appId: 'planner',
        action: 'task_completed',
        title: `Crushed Task: ${card.title}`,
        details: `Moved to Done from ${prevCol}`,
        xpEarned: 35,
        metadata: { cardId }
      });

      ui.toast({
        title: 'Task Done! ✓',
        message: `+35 XP earned for completing "${card.title}"`,
        type: 'success',
        action: {
          label: 'Undo',
          onClick: () => {
            store.setKanbanCards(p => p.map(item => item.id === cardId ? { ...item, column: prevCol } : item));
          }
        }
      });
    }

    container.innerHTML = this.render();
    this.init(container);
  },

  openTaskModal(existingCard, container) {
    const isEdit = Boolean(existingCard && existingCard.id);
    const card = existingCard || {
      title: '',
      column: 'To Do',
      priority: 'high',
      deadline: new Date().toISOString().split('T')[0],
      labels: ['Task'],
      subtasks: []
    };

    ui.modal({
      title: isEdit ? 'Edit Task Card' : 'Create New Task Card',
      width: '480px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Task Title *</label>
          <input type="text" id="task-title-input" class="form-input" placeholder="e.g. Finalize CS 229 Problem Set 2" value="${escapeHtml(card.title)}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Column</label>
            <select id="task-col-select" class="form-select">
              <option value="To Do" ${card.column === 'To Do' ? 'selected' : ''}>To Do</option>
              <option value="In Progress" ${card.column === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Done" ${card.column === 'Done' ? 'selected' : ''}>Done</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="task-priority-select" class="form-select">
              <option value="high" ${card.priority === 'high' ? 'selected' : ''}>High Priority</option>
              <option value="medium" ${card.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
              <option value="low" ${card.priority === 'low' ? 'selected' : ''}>Low Priority</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Due Date</label>
            <input type="date" id="task-deadline-input" class="form-input" value="${card.deadline || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Labels (comma separated)</label>
            <input type="text" id="task-labels-input" class="form-input" placeholder="e.g. CS 229, Exams, Pset" value="${escapeHtml((card.labels || []).join(', '))}" />
          </div>
        </div>

        <!-- Subtasks Section -->
        <div style="margin-top: var(--space-3); border-top: 1px solid var(--os-border); padding-top: var(--space-3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
            <label class="form-label" style="margin-bottom: 0;">Subtasks &amp; Checklist</label>
            <button type="button" class="btn btn-ghost btn-xs" id="btn-add-modal-subtask">+ Add Subtask</button>
          </div>
          <div id="modal-subtasks-container" style="display: flex; flex-direction: column; gap: 6px;">
            ${(card.subtasks || []).map((st, i) => `
              <div class="modal-subtask-row" style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" class="modal-subtask-check" ${st.completed ? 'checked' : ''} />
                <input type="text" class="form-input modal-subtask-text" value="${escapeHtml(st.text)}" style="padding: 4px 8px; font-size: 0.75rem;" />
                <button type="button" class="btn btn-ghost btn-xs btn-remove-subtask" style="padding: 2px 6px;">×</button>
              </div>
            `).join('')}
          </div>
        </div>
      `,
      confirmText: isEdit ? 'Save Changes' : 'Create Task',
      onOpen: (modalEl) => {
        const subContainer = modalEl.querySelector('#modal-subtasks-container');
        const addSubBtn = modalEl.querySelector('#btn-add-modal-subtask');

        const bindSubtaskEvents = () => {
          subContainer.querySelectorAll('.btn-remove-subtask').forEach(b => {
            b.onclick = () => b.closest('.modal-subtask-row')?.remove();
          });
        };
        bindSubtaskEvents();

        addSubBtn?.addEventListener('click', () => {
          const row = document.createElement('div');
          row.className = 'modal-subtask-row';
          row.style.cssText = 'display: flex; align-items: center; gap: 8px;';
          row.innerHTML = `
            <input type="checkbox" class="modal-subtask-check" />
            <input type="text" class="form-input modal-subtask-text" placeholder="Subtask detail..." style="padding: 4px 8px; font-size: 0.75rem;" />
            <button type="button" class="btn btn-ghost btn-xs btn-remove-subtask" style="padding: 2px 6px;">×</button>
          `;
          subContainer.appendChild(row);
          row.querySelector('input[type=text]')?.focus();
          bindSubtaskEvents();
        });
      },
      onConfirm: (modalEl) => {
        const title = modalEl.querySelector('#task-title-input')?.value.trim();
        if (!title) {
          ui.toast({ title: 'Validation Error', message: 'Task title is required.', type: 'error' });
          return false;
        }

        const column = modalEl.querySelector('#task-col-select')?.value;
        const priority = modalEl.querySelector('#task-priority-select')?.value;
        const deadline = modalEl.querySelector('#task-deadline-input')?.value || '';
        const rawLabels = modalEl.querySelector('#task-labels-input')?.value || '';
        const labels = rawLabels.split(',').map(l => l.trim()).filter(Boolean);

        const subtasks = [];
        modalEl.querySelectorAll('.modal-subtask-row').forEach(row => {
          const text = row.querySelector('.modal-subtask-text')?.value.trim();
          const completed = row.querySelector('.modal-subtask-check')?.checked || false;
          if (text) {
            subtasks.push({ id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, text, completed });
          }
        });

        if (isEdit) {
          store.setKanbanCards(prev => prev.map(c => {
            if (c.id === card.id) {
              return { ...c, title, column, priority, deadline, labels, subtasks };
            }
            return c;
          }));
          ui.toast({ title: 'Task Updated', message: `Saved changes for "${title}".`, type: 'success' });
        } else {
          const newCard = {
            id: `kc-${Date.now()}`,
            title,
            column,
            priority,
            deadline,
            labels: labels.length > 0 ? labels : ['Task'],
            subtasks
          };
          store.setKanbanCards(prev => [newCard, ...prev]);
          logActivity({
            appId: 'planner',
            action: 'task_created',
            title: `Added Task: ${title}`,
            details: `Column: ${column} • Priority: ${priority}`,
            xpEarned: 20
          });
          ui.toast({ title: 'Task Created', message: `+20 XP awarded for planning "${title}"!`, type: 'success' });
        }

        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  destroy() {}
};

export default plannerApp;
