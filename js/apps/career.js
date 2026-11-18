// COLLEGE OS - App: Career, Skills Tree, Portfolio & Coding Practice

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

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
      return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
          ${(state.skills || []).map(sk => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="badge badge-primary">${escapeHtml(sk.category)}</span>
                <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: #f59e0b;">Lvl ${sk.level} / 5</span>
              </div>
              <h3 style="font-size: 1.125rem; margin: var(--space-2) 0; font-family: var(--font-display);">${escapeHtml(sk.name)}</h3>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${(sk.level / 5) * 100}%;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--os-text-muted); font-family: var(--font-mono); margin-top: 8px;">
                <span>${sk.hours} Deep Work Hours</span>
                <span>${sk.xp} Skill XP</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (tab === 'projects') {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          ${(state.projects || []).map(prj => `
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 1.125rem; font-family: var(--font-display);">${escapeHtml(prj.name)}</h3>
                <span class="badge ${prj.status === 'Completed' ? 'badge-success' : 'badge-primary'}">${prj.status}</span>
              </div>
              <p style="font-size: 0.8125rem; color: var(--os-text-muted); margin: var(--space-2) 0;">${escapeHtml(prj.description)}</p>
              <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-accent); margin-bottom: var(--space-3);">
                Tech Stack: ${escapeHtml(prj.technology)}
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${prj.progress}%;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (tab === 'internships') {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${(state.internships || []).map(int => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
              <div>
                <div style="font-size: 1rem; font-weight: 700;">${escapeHtml(int.company)}</div>
                <div style="font-size: 0.8125rem; color: var(--os-text-muted);">${escapeHtml(int.role)}</div>
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 4px;">Applied: ${int.appliedDate} • Compensation: ${int.stipend}</div>
              </div>
              <span class="badge badge-warning" style="font-size: 0.75rem;">${int.status}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (tab === 'leetcode') {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.8125rem; color: var(--os-text-muted);">Algorithmic Problem Log</div>
            <button class="btn btn-primary btn-sm" id="btn-add-coding">
              ${getIcon('plus', 'w-3.5 h-3.5')} Log Problem (+75 XP)
            </button>
          </div>
          ${(state.codingPractice || []).map(cp => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <span style="font-weight: 700; font-size: 0.875rem;">${escapeHtml(cp.problem)}</span>
                  <span class="badge ${cp.difficulty === 'Hard' ? 'badge-error' : cp.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'}">${cp.difficulty}</span>
                </div>
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 2px;">${cp.platform} • Topic: ${escapeHtml(cp.topic)} • ${cp.date}</div>
              </div>
              <span style="color: var(--os-success); font-weight: 700; font-size: 0.8125rem;">✓ Solved</span>
            </div>
          `).join('')}
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

    // Add coding problem button
    const addCodingBtn = container.querySelector('#btn-add-coding');
    addCodingBtn?.addEventListener('click', () => {
      const name = prompt("Problem name (e.g. Invert Binary Tree):");
      if (name) {
        const newProb = {
          id: `cp-${Date.now()}`,
          platform: "LeetCode",
          problem: name.trim(),
          difficulty: "Medium",
          topic: "Data Structures",
          date: new Date().toISOString().split('T')[0],
          solved: true
        };
        store.setCodingPractice(prev => [newProb, ...prev]);
        awardXP(75, `Solved problem: ${name}`);
        container.innerHTML = this.render();
        this.init(container);
      }
    });
  },

  destroy() {}
};

export default careerApp;
