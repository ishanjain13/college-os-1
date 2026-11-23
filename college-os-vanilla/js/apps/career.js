// COLLEGE OS - App: Career, Skills Tree, Portfolio & Coding Practice

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

export const careerApp = {
  id: 'career',
  title: 'Career & Projects',
  icon: 'briefcase',
  currentTab: 'skills',

  render() {
    const state = store.get();
    const currentTab = this.currentTab;

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Career Engine &amp; Technical Capital</h2>
            <p>Skill trees, portfolio proof-of-work, internship pipeline, and algorithmic mastery.</p>
          </div>
          <div class="tab-list">
            <button class="tab-btn ${currentTab === 'skills' ? 'active' : ''}" data-career-tab="skills">
              ${getIcon('zap', 'w-3.5 h-3.5')} Skills Tree
            </button>
            <button class="tab-btn ${currentTab === 'projects' ? 'active' : ''}" data-career-tab="projects">
              ${getIcon('code', 'w-3.5 h-3.5')} Projects
            </button>
            <button class="tab-btn ${currentTab === 'internships' ? 'active' : ''}" data-career-tab="internships">
              ${getIcon('briefcase', 'w-3.5 h-3.5')} Internships
            </button>
            <button class="tab-btn ${currentTab === 'leetcode' ? 'active' : ''}" data-career-tab="leetcode">
              ${getIcon('sparkles', 'w-3.5 h-3.5')} Coding Practice
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="app-body">
          ${this.renderTab(state, currentTab)}
        </div>
      </div>
    `;
  },

  renderTab(state, tab) {
    if (tab === 'skills') {
      const skills = state.skills || [];
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">Mastery Trees: <strong>${skills.length} Technical Domains</strong></div>
            <button class="btn btn-primary btn-sm" id="btn-add-skill">
              ${getIcon('plus', 'w-3.5 h-3.5')} Add Skill
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
            ${skills.map(sk => `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid var(--os-accent);">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="badge badge-primary">${escapeHtml(sk.category)}</span>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: #f59e0b;">Lvl ${sk.level} / 5</span>
                      <button class="btn btn-ghost btn-xs" data-del-skill="${sk.id}">×</button>
                    </div>
                  </div>
                  <h3 style="font-size: 1.125rem; margin: var(--space-2) 0; font-family: var(--font-display);">${escapeHtml(sk.name)}</h3>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${(sk.level / 5) * 100}%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--os-text-muted); font-family: var(--font-mono); margin-top: 8px;">
                    <span>${sk.hours || 0} Practice Hours</span>
                    <span>${sk.xp || 0} Skill XP</span>
                  </div>
                </div>
                <div style="display: flex; justify-content: flex-end; margin-top: var(--space-3); border-top: 1px solid var(--os-border-subtle); padding-top: var(--space-2);">
                  <button class="btn btn-secondary btn-xs" data-log-skill-hours="${sk.id}">
                    + Log 2hrs Practice (+50 XP)
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'projects') {
      const projects = state.projects || [];
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">Proof of Work: <strong>${projects.length} Engineering Projects</strong></div>
            <button class="btn btn-primary btn-sm" id="btn-add-project">
              ${getIcon('plus', 'w-3.5 h-3.5')} New Project
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            ${projects.map(prj => `
              <div class="card" style="border-left: 3px solid ${prj.status === 'Completed' ? 'var(--os-success)' : 'var(--os-accent)'};">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <h3 style="font-size: 1.125rem; font-family: var(--font-display);">${escapeHtml(prj.name)}</h3>
                    <span class="badge ${prj.status === 'Completed' ? 'badge-success' : 'badge-primary'}">${prj.status}</span>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <button class="btn btn-ghost btn-xs" data-edit-prj="${prj.id}">${getIcon('edit-2', 'w-3 h-3')}</button>
                    <button class="btn btn-ghost btn-xs" data-del-prj="${prj.id}">×</button>
                  </div>
                </div>
                <p style="font-size: 0.8125rem; color: var(--os-text-muted); margin: var(--space-2) 0;">${escapeHtml(prj.description)}</p>
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-accent); margin-bottom: var(--space-3);">
                  Tech Stack: ${escapeHtml(prj.technology)} ${prj.githubUrl ? `• <a href="${escapeHtml(prj.githubUrl)}" target="_blank" style="color: var(--os-text);">GitHub Repo ↗</a>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                  <div class="progress-bar-container" style="flex: 1;">
                    <div class="progress-bar-fill" style="width: ${prj.progress}%;"></div>
                  </div>
                  <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-muted);">${prj.progress}%</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'internships') {
      const internships = state.internships || [];
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">Application Funnel: <strong>${internships.length} Tracked Roles</strong></div>
            <button class="btn btn-primary btn-sm" id="btn-add-internship">
              ${getIcon('plus', 'w-3.5 h-3.5')} Track Opportunity
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${internships.map(int => `
              <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                <div>
                  <div style="font-size: 1rem; font-weight: 700; color: var(--os-text);">${escapeHtml(int.company)}</div>
                  <div style="font-size: 0.8125rem; color: var(--os-text-muted);">${escapeHtml(int.role)}</div>
                  <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 4px;">
                    Applied: ${int.appliedDate} • Compensation: ${escapeHtml(int.stipend || 'TBD')} ${int.notes ? `• ${escapeHtml(int.notes)}` : ''}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <span class="badge ${int.status === 'Offer' ? 'badge-success' : int.status === 'Interview' ? 'badge-primary' : 'badge-warning'}" style="font-size: 0.75rem;">
                    ${int.status}
                  </span>
                  <button class="btn btn-ghost btn-xs" data-edit-int="${int.id}">${getIcon('edit-2', 'w-3 h-3')}</button>
                  <button class="btn btn-ghost btn-xs" data-del-int="${int.id}">×</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'leetcode') {
      const coding = state.codingPractice || [];
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">
              Algorithmic Problem Log: <strong>${coding.length} Solved</strong>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-coding">
              ${getIcon('plus', 'w-3.5 h-3.5')} Log Problem (+75 XP)
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            ${coding.map(cp => `
              <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
                <div>
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span style="font-weight: 700; font-size: 0.875rem; color: var(--os-text);">${escapeHtml(cp.problem)}</span>
                    <span class="badge ${cp.difficulty === 'Hard' ? 'badge-error' : cp.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'}">${cp.difficulty}</span>
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 2px;">
                    ${cp.platform} • Topic: ${escapeHtml(cp.topic)} • ${cp.date}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <span style="color: var(--os-success); font-weight: 700; font-size: 0.8125rem;">✓ Solved</span>
                  <button class="btn btn-ghost btn-xs" data-del-coding="${cp.id}">×</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return '';
  },

  init(container) {
    // Tab switching
    container.querySelectorAll('[data-career-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.currentTab = btn.getAttribute('data-career-tab');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // --- SKILLS HANDLERS ---
    container.querySelector('#btn-add-skill')?.addEventListener('click', () => {
      ui.modal({
        title: 'Add Technical Domain / Skill',
        width: '420px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Skill Name *</label>
            <input type="text" id="modal-skill-name" class="form-input" placeholder="e.g. Distributed Systems & Go" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <input type="text" id="modal-skill-cat" class="form-input" placeholder="Software & AI" value="Software & AI" />
            </div>
            <div class="form-group">
              <label class="form-label">Level (1-5)</label>
              <input type="number" id="modal-skill-lvl" class="form-input" min="1" max="5" value="1" />
            </div>
          </div>
        `,
        confirmText: 'Establish Skill',
        onConfirm: (modalEl) => {
          const name = modalEl.querySelector('#modal-skill-name')?.value.trim();
          if (!name) return false;
          const category = modalEl.querySelector('#modal-skill-cat')?.value.trim() || 'Software';
          const level = Number(modalEl.querySelector('#modal-skill-lvl')?.value) || 1;

          const newSkill = {
            id: `sk-${Date.now()}`,
            name,
            category,
            level,
            hours: 10,
            xp: level * 500
          };
          store.setSkills(prev => [...prev, newSkill]);
          ui.toast({ title: 'Skill Added', message: `Added ${name} to skill tree.`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    container.querySelectorAll('[data-log-skill-hours]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-log-skill-hours');
        store.setSkills(prev => prev.map(s => {
          if (s.id === id) {
            const newHours = (s.hours || 0) + 2;
            const newXP = (s.xp || 0) + 100;
            const newLvl = Math.min(5, Math.floor(newHours / 30) + 1);
            logActivity({
              appId: 'career',
              action: 'skill_practice',
              title: `Logged Practice: ${s.name}`,
              details: `Total: ${newHours} hours (Level ${newLvl})`,
              xpEarned: 50
            });
            ui.toast({ title: 'Practice Logged! ⚡', message: `+50 XP awarded for practicing ${s.name}`, type: 'success' });
            return { ...s, hours: newHours, xp: newXP, level: newLvl };
          }
          return s;
        }));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    container.querySelectorAll('[data-del-skill]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-skill');
        store.setSkills(prev => prev.filter(s => s.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // --- PROJECTS HANDLERS ---
    container.querySelector('#btn-add-project')?.addEventListener('click', () => {
      ui.modal({
        title: 'Add Portfolio Project',
        width: '460px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Project Title *</label>
            <input type="text" id="modal-prj-name" class="form-input" placeholder="e.g. Distributed Key-Value Store" />
          </div>
          <div class="form-group">
            <label class="form-label">Tech Stack</label>
            <input type="text" id="modal-prj-tech" class="form-input" placeholder="e.g. Rust, Raft Consensus, gRPC" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="modal-prj-status" class="form-select">
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Idea">Idea</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Progress (%)</label>
              <input type="number" id="modal-prj-prog" class="form-input" min="0" max="100" value="40" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="modal-prj-desc" class="form-textarea" placeholder="Key architecture details and engineering challenges..."></textarea>
          </div>
        `,
        confirmText: 'Create Project',
        onConfirm: (modalEl) => {
          const name = modalEl.querySelector('#modal-prj-name')?.value.trim();
          if (!name) return false;
          const technology = modalEl.querySelector('#modal-prj-tech')?.value.trim() || 'Software';
          const status = modalEl.querySelector('#modal-prj-status')?.value;
          const progress = Number(modalEl.querySelector('#modal-prj-prog')?.value) || 0;
          const description = modalEl.querySelector('#modal-prj-desc')?.value.trim() || '';

          const newPrj = {
            id: `prj-${Date.now()}`,
            name,
            technology,
            status,
            progress,
            description
          };
          store.setProjects(prev => [...prev, newPrj]);
          logActivity({
            appId: 'career',
            action: 'project_added',
            title: `Started Project: ${name}`,
            details: `Tech: ${technology}`,
            xpEarned: 60
          });
          ui.toast({ title: 'Project Initiated', message: `+60 XP for launching "${name}"!`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    container.querySelectorAll('[data-del-prj]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-prj');
        store.setProjects(prev => prev.filter(p => p.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // --- INTERNSHIP HANDLERS ---
    container.querySelector('#btn-add-internship')?.addEventListener('click', () => {
      ui.modal({
        title: 'Track Internship Opportunity',
        width: '440px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Company Name *</label>
            <input type="text" id="modal-int-company" class="form-input" placeholder="e.g. OpenAI / Google" />
          </div>
          <div class="form-group">
            <label class="form-label">Role Title *</label>
            <input type="text" id="modal-int-role" class="form-input" placeholder="e.g. Software Engineer Intern" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="modal-int-status" class="form-select">
                <option value="Applied">Applied</option>
                <option value="Assessment">Assessment</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Comp / Stipend</label>
              <input type="text" id="modal-int-stipend" class="form-input" placeholder="$60/hr" value="$60/hr" />
            </div>
          </div>
        `,
        confirmText: 'Save Opportunity',
        onConfirm: (modalEl) => {
          const company = modalEl.querySelector('#modal-int-company')?.value.trim();
          const role = modalEl.querySelector('#modal-int-role')?.value.trim();
          if (!company || !role) return false;
          const status = modalEl.querySelector('#modal-int-status')?.value;
          const stipend = modalEl.querySelector('#modal-int-stipend')?.value.trim() || 'TBD';

          const newInt = {
            id: `int-${Date.now()}`,
            company,
            role,
            status,
            stipend,
            appliedDate: new Date().toISOString().split('T')[0],
            notes: ''
          };
          store.setInternships(prev => [...prev, newInt]);
          ui.toast({ title: 'Application Tracked', message: `Added ${company} to funnel.`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    container.querySelectorAll('[data-del-int]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-int');
        store.setInternships(prev => prev.filter(i => i.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // --- LEETCODE HANDLERS ---
    container.querySelector('#btn-add-coding')?.addEventListener('click', () => {
      ui.modal({
        title: 'Log Solved Coding Problem',
        width: '420px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Problem Title *</label>
            <input type="text" id="modal-cp-name" class="form-input" placeholder="e.g. Trapping Rain Water" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Difficulty</label>
              <select id="modal-cp-diff" class="form-select">
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Easy">Easy</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Topic / Pattern</label>
              <input type="text" id="modal-cp-topic" class="form-input" placeholder="e.g. Two Pointers" value="Dynamic Programming" />
            </div>
          </div>
        `,
        confirmText: 'Log Solved (+75 XP)',
        onConfirm: (modalEl) => {
          const problem = modalEl.querySelector('#modal-cp-name')?.value.trim();
          if (!problem) return false;
          const difficulty = modalEl.querySelector('#modal-cp-diff')?.value;
          const topic = modalEl.querySelector('#modal-cp-topic')?.value.trim() || 'Algorithms';

          const newProb = {
            id: `cp-${Date.now()}`,
            platform: 'LeetCode',
            problem,
            difficulty,
            topic,
            date: new Date().toISOString().split('T')[0],
            solved: true
          };

          store.setCodingPractice(prev => [newProb, ...prev]);
          logActivity({
            appId: 'career',
            action: 'problem_solved',
            title: `Solved Problem: ${problem}`,
            details: `${difficulty} • Topic: ${topic}`,
            xpEarned: 75
          });

          ui.toast({ title: 'Problem Solved! 💻', message: `+75 XP awarded for crushing "${problem}"!`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    container.querySelectorAll('[data-del-coding]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-coding');
        store.setCodingPractice(prev => prev.filter(c => c.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default careerApp;
