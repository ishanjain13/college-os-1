// COLLEGE OS - App: Campus Life, Roommate Chores & Academic Directory

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const campusApp = {
  id: 'campus',
  title: 'Campus Life & Room',
  icon: 'users',
  currentTab: 'chores',

  render() {
    const state = store.get();
    const campus = state.campus || { chores: [], events: [], contacts: [] };
    const currentTab = this.currentTab;

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Campus Life &amp; Roommate Hub</h2>
            <p>Shared apartment chores, campus events calendar, and faculty office hours directory.</p>
          </div>
          <div class="tab-list">
            <button class="tab-btn ${currentTab === 'chores' ? 'active' : ''}" data-campus-tab="chores">
              ${getIcon('check-square', 'w-3.5 h-3.5')} Roommate Chores (${(campus.chores || []).filter(c => !c.completed).length})
            </button>
            <button class="tab-btn ${currentTab === 'events' ? 'active' : ''}" data-campus-tab="events">
              ${getIcon('calendar', 'w-3.5 h-3.5')} Campus Events (${(campus.events || []).length})
            </button>
            <button class="tab-btn ${currentTab === 'contacts' ? 'active' : ''}" data-campus-tab="contacts">
              ${getIcon('users', 'w-3.5 h-3.5')} Faculty &amp; TAs (${(campus.contacts || []).length})
            </button>
          </div>
        </div>

        <div class="app-body">
          ${currentTab === 'chores' ? `
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                <div style="font-size: 0.8125rem; color: var(--os-text-muted);">
                  Shared Responsibilities: <strong>${(campus.chores || []).filter(c => c.completed).length} of ${(campus.chores || []).length} Completed</strong>
                </div>
                <button class="btn btn-primary btn-sm" id="btn-add-chore">
                  ${getIcon('plus', 'w-3.5 h-3.5')} Add Chore
                </button>
              </div>

              ${(campus.chores || []).length === 0 ? ui.emptyState({
                icon: 'check-square',
                title: 'No shared chores active',
                description: 'Organize cleaning rotations, grocery runs, and apartment maintenance.',
                actionText: 'Add First Chore',
                actionId: 'btn-empty-add-chore'
              }) : `
                <div style="display: flex; flex-direction: column; gap: var(--space-2-5);">
                  ${(campus.chores || []).map(chr => `
                    <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); border-left: 3px solid ${chr.completed ? 'var(--os-success)' : 'var(--os-warning)'};">
                      <div style="display: flex; align-items: center; gap: var(--space-3); cursor: pointer; flex: 1;" data-toggle-chore="${chr.id}">
                        <div style="width: 18px; height: 18px; border-radius: var(--radius-xs); border: 1px solid ${chr.completed ? 'var(--os-success)' : 'var(--os-border-light)'}; background: ${chr.completed ? 'var(--os-success)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;">
                          ${chr.completed ? getIcon('check', 'w-3 h-3') : ''}
                        </div>
                        <div>
                          <div style="font-weight: 700; font-size: 0.875rem; color: ${chr.completed ? 'var(--os-text-muted)' : 'var(--os-text)'}; text-decoration: ${chr.completed ? 'line-through' : 'none'};">
                            ${escapeHtml(chr.title)}
                          </div>
                          <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 2px; font-family: var(--font-mono);">
                            Assigned to: <strong style="color: var(--os-accent);">${escapeHtml(chr.assignedTo || 'Unassigned')}</strong> • Frequency: ${chr.frequency || 'Weekly'} ${chr.dueDate ? `• Due: ${chr.dueDate}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style="display: flex; gap: 4px;">
                        <button class="btn btn-ghost btn-xs" data-del-chore="${chr.id}">×</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          ` : currentTab === 'events' ? `
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                <div style="font-size: 0.8125rem; color: var(--os-text-muted);">Campus Life &amp; Hackathons</div>
                <button class="btn btn-primary btn-sm" id="btn-add-event">
                  ${getIcon('plus', 'w-3.5 h-3.5')} Post Campus Event
                </button>
              </div>

              ${(campus.events || []).length === 0 ? ui.emptyState({
                icon: 'calendar',
                title: 'No upcoming campus events',
                description: 'Add club meetups, hackathons, and guest lectures to stay connected.',
                actionText: 'Post Event',
                actionId: 'btn-empty-add-event'
              }) : `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
                  ${(campus.events || []).map(ev => `
                    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid var(--os-accent);">
                      <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                          <span class="badge badge-primary">${escapeHtml(ev.category || 'Event')}</span>
                          <button class="btn btn-ghost btn-xs" data-del-event="${ev.id}">×</button>
                        </div>
                        <h4 style="font-size: 1rem; font-weight: 700; color: var(--os-text);">${escapeHtml(ev.title)}</h4>
                        <div style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">
                          ${getIcon('map-pin', 'w-3 h-3')} ${escapeHtml(ev.location)}
                        </div>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border-subtle); padding-top: var(--space-2); margin-top: var(--space-3); font-size: 0.75rem;">
                        <span style="font-family: var(--font-mono); color: var(--os-accent);">${ev.date ? ev.date.replace('T', ' ') : 'Upcoming'}</span>
                        <button class="btn ${ev.attending ? 'btn-secondary' : 'btn-primary'} btn-xs" data-toggle-rsvp="${ev.id}">
                          ${ev.attending ? '✓ RSVP Attending' : 'RSVP (+25 XP)'}
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          ` : `
            <!-- Faculty Directory -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                <div style="font-size: 0.8125rem; color: var(--os-text-muted);">Professors, Instructors &amp; TA Contacts</div>
                <button class="btn btn-primary btn-sm" id="btn-add-contact">
                  ${getIcon('plus', 'w-3.5 h-3.5')} Add Contact
                </button>
              </div>

              ${(campus.contacts || []).length === 0 ? ui.emptyState({
                icon: 'users',
                title: 'No contacts added',
                description: 'Save professors, teaching assistants, and office hour times for quick access.',
                actionText: 'Add Contact',
                actionId: 'btn-empty-add-contact'
              }) : `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-3);">
                  ${(campus.contacts || []).map(con => `
                    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                      <div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <h4 style="font-size: 1rem; font-weight: 700;">${escapeHtml(con.name)}</h4>
                          <button class="btn btn-ghost btn-xs" data-del-contact="${con.id}">×</button>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--os-text-muted); margin-top: 2px;">${escapeHtml(con.role)}</div>
                        <div style="font-size: 0.75rem; color: var(--os-text-subtle); margin-top: 6px;">
                          <div>Office: <strong>${escapeHtml(con.office || 'TBD')}</strong></div>
                          <div>Hours: <strong>${escapeHtml(con.hours || 'By appointment')}</strong></div>
                        </div>
                      </div>
                      <div style="border-top: 1px solid var(--os-border-subtle); padding-top: var(--space-2); margin-top: var(--space-3);">
                        <a href="mailto:${escapeHtml(con.email)}" class="btn btn-secondary btn-xs" style="width: 100%;">
                          ${getIcon('mail', 'w-3 h-3')} Email ${escapeHtml(con.name)}
                        </a>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          `}
        </div>
      </div>
    `;
  },

  init(container) {
    // Tab switching
    container.querySelectorAll('[data-campus-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.currentTab = btn.getAttribute('data-campus-tab');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // --- CHORES HANDLERS ---
    container.querySelector('#btn-add-chore')?.addEventListener('click', () => this.openChoreModal(container));
    container.querySelector('#btn-empty-add-chore')?.addEventListener('click', () => this.openChoreModal(container));

    container.querySelectorAll('[data-toggle-chore]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-toggle-chore');
        store.setCampus(prev => {
          const chores = (prev.chores || []).map(c => {
            if (c.id === id) {
              const nextComp = !c.completed;
              if (nextComp) {
                logActivity({
                  appId: 'campus',
                  action: 'chore_completed',
                  title: `Completed Apartment Chore: ${c.title}`,
                  details: `Assigned: ${c.assignedTo}`,
                  xpEarned: 30
                });
                ui.toast({ title: 'Chore Done! 🧼', message: `+30 XP awarded for ${c.title}`, type: 'success' });
              }
              return { ...c, completed: nextComp };
            }
            return c;
          });
          return { ...prev, chores };
        });
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    container.querySelectorAll('[data-del-chore]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-chore');
        store.setCampus(prev => ({
          ...prev,
          chores: (prev.chores || []).filter(c => c.id !== id)
        }));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // --- EVENTS HANDLERS ---
    container.querySelector('#btn-add-event')?.addEventListener('click', () => this.openEventModal(container));
    container.querySelector('#btn-empty-add-event')?.addEventListener('click', () => this.openEventModal(container));

    container.querySelectorAll('[data-toggle-rsvp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-rsvp');
        store.setCampus(prev => {
          const events = (prev.events || []).map(ev => {
            if (ev.id === id) {
              const nextRsvp = !ev.attending;
              if (nextRsvp) {
                awardXP(25, `RSVP: ${ev.title}`);
                ui.toast({ title: 'RSVP Confirmed!', message: `+25 XP! Added ${ev.title} to calendar.`, type: 'success' });
              }
              return { ...ev, attending: nextRsvp };
            }
            return ev;
          });
          return { ...prev, events };
        });
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    container.querySelectorAll('[data-del-event]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-event');
        store.setCampus(prev => ({
          ...prev,
          events: (prev.events || []).filter(e => e.id !== id)
        }));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // --- CONTACTS HANDLERS ---
    container.querySelector('#btn-add-contact')?.addEventListener('click', () => this.openContactModal(container));
    container.querySelector('#btn-empty-add-contact')?.addEventListener('click', () => this.openContactModal(container));

    container.querySelectorAll('[data-del-contact]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-contact');
        store.setCampus(prev => ({
          ...prev,
          contacts: (prev.contacts || []).filter(c => c.id !== id)
        }));
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  openChoreModal(container) {
    ui.modal({
      title: 'Add Apartment / Roommate Chore',
      width: '420px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Chore Title *</label>
          <input type="text" id="modal-chore-title" class="form-input" placeholder="e.g. Clean Kitchen Counters & Sink" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Assigned To</label>
            <input type="text" id="modal-chore-assigned" class="form-input" placeholder="e.g. Alex" value="Alex" />
          </div>
          <div class="form-group">
            <label class="form-label">Frequency</label>
            <select id="modal-chore-freq" class="form-select">
              <option value="Weekly">Weekly</option>
              <option value="Daily">Daily</option>
              <option value="Biweekly">Biweekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input type="date" id="modal-chore-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
        </div>
      `,
      confirmText: 'Add Chore',
      onConfirm: (modalEl) => {
        const title = modalEl.querySelector('#modal-chore-title')?.value.trim();
        if (!title) return false;
        const assignedTo = modalEl.querySelector('#modal-chore-assigned')?.value.trim() || 'Alex';
        const frequency = modalEl.querySelector('#modal-chore-freq')?.value;
        const dueDate = modalEl.querySelector('#modal-chore-date')?.value || '';

        const newChore = {
          id: `chr-${Date.now()}`,
          title,
          assignedTo,
          frequency,
          dueDate,
          completed: false
        };

        store.setCampus(prev => ({ ...prev, chores: [...(prev.chores || []), newChore] }));
        ui.toast({ title: 'Chore Added', message: `Added ${title}`, type: 'success' });
        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  openEventModal(container) {
    ui.modal({
      title: 'Post Campus Event',
      width: '440px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Event Name *</label>
          <input type="text" id="modal-ev-title" class="form-input" placeholder="e.g. Fall Hackathon 2026" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Location / Building</label>
            <input type="text" id="modal-ev-loc" class="form-input" placeholder="e.g. Gates CS Building" />
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="modal-ev-cat" class="form-select">
              <option value="Career">Career & Expo</option>
              <option value="Academic">Academic Seminar</option>
              <option value="Social">Social & Club</option>
              <option value="Sports">Sports & Fitness</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Date &amp; Time</label>
          <input type="datetime-local" id="modal-ev-date" class="form-input" value="${new Date().toISOString().slice(0, 16)}" />
        </div>
      `,
      confirmText: 'Post Event',
      onConfirm: (modalEl) => {
        const title = modalEl.querySelector('#modal-ev-title')?.value.trim();
        if (!title) return false;
        const location = modalEl.querySelector('#modal-ev-loc')?.value.trim() || 'Campus';
        const category = modalEl.querySelector('#modal-ev-cat')?.value;
        const date = modalEl.querySelector('#modal-ev-date')?.value || '';

        const newEvent = {
          id: `ev-${Date.now()}`,
          title,
          location,
          category,
          date,
          attending: true
        };

        store.setCampus(prev => ({ ...prev, events: [...(prev.events || []), newEvent] }));
        ui.toast({ title: 'Event Posted', message: `Added ${title}`, type: 'success' });
        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  openContactModal(container) {
    ui.modal({
      title: 'Add Faculty / TA Contact',
      width: '440px',
      contentHtml: `
        <div class="form-group">
          <label class="form-label">Name *</label>
          <input type="text" id="modal-con-name" class="form-input" placeholder="e.g. Prof. Andrew" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Role / Course</label>
            <input type="text" id="modal-con-role" class="form-input" placeholder="e.g. CS 229 Instructor" />
          </div>
          <div class="form-group">
            <label class="form-label">Office</label>
            <input type="text" id="modal-con-office" class="form-input" placeholder="e.g. Gates 340" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="modal-con-email" class="form-input" placeholder="andrew@univ.edu" />
          </div>
          <div class="form-group">
            <label class="form-label">Office Hours</label>
            <input type="text" id="modal-con-hours" class="form-input" placeholder="e.g. Mon 14:00 - 16:00" />
          </div>
        </div>
      `,
      confirmText: 'Save Contact',
      onConfirm: (modalEl) => {
        const name = modalEl.querySelector('#modal-con-name')?.value.trim();
        if (!name) return false;
        const role = modalEl.querySelector('#modal-con-role')?.value.trim() || 'Faculty';
        const office = modalEl.querySelector('#modal-con-office')?.value.trim() || 'TBD';
        const email = modalEl.querySelector('#modal-con-email')?.value.trim() || '';
        const hours = modalEl.querySelector('#modal-con-hours')?.value.trim() || '';

        const newCon = {
          id: `con-${Date.now()}`,
          name,
          role,
          office,
          email,
          hours
        };

        store.setCampus(prev => ({ ...prev, contacts: [...(prev.contacts || []), newCon] }));
        ui.toast({ title: 'Contact Saved', message: `Added ${name} to directory.`, type: 'success' });
        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  destroy() {}
};

export default campusApp;
