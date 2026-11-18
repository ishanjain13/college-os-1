// COLLEGE OS - App: Gamification, Weekly Boss Battle & Achievements

import store from '../state.js';
import { calculateLevelInfo, awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import { triggerConfetti } from '../confetti.js';

export const gamificationApp = {
  id: 'achievements',
  title: 'Gamification & Boss',
  icon: 'trophy',
  currentTab: 'boss',

  render() {
    const state = store.get();
    const currentTab = this.currentTab;
    const levelInfo = calculateLevelInfo(state.profile.totalXP, state.levelTiers);
    const boss = state.weeklyBoss || { name: 'Gorgon of Procrastination', hpCurrent: 35, hpTotal: 100, requirements: [] };

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Gamification &amp; Boss Battles</h2>
            <p>Conquer procrastination bosses, level up rank tiers, and claim real-life guilt-free rewards.</p>
          </div>
          <div class="tab-list">
            <button class="tab-btn ${currentTab === 'boss' ? 'active' : ''}" data-gamify-tab="boss">
              ${getIcon('crown', 'w-3.5 h-3.5')} Boss Battle
            </button>
            <button class="tab-btn ${currentTab === 'achievements' ? 'active' : ''}" data-gamify-tab="achievements">
              ${getIcon('trophy', 'w-3.5 h-3.5')} Badges &amp; Trophies
            </button>
            <button class="tab-btn ${currentTab === 'shop' ? 'active' : ''}" data-gamify-tab="shop">
              ${getIcon('sparkles', 'w-3.5 h-3.5')} Reward Shop
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="app-body">
          ${currentTab === 'boss' ? `
            <!-- Boss Card -->
            <div class="boss-card">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); flex-wrap: wrap;">
                <div>
                  <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f43f5e; font-weight: 700; text-transform: uppercase;">
                    WEEKLY MOMENTUM RAID BOSS
                  </div>
                  <h3 style="font-size: 1.5rem; font-family: var(--font-display); color: #ffffff; margin: 4px 0;">
                    ${escapeHtml(boss.name)}
                  </h3>
                  <p style="font-size: 0.8125rem; color: #cbd5e1;">${escapeHtml(boss.subtitle || 'Midterm Readiness Gatekeeper')}</p>
                </div>
                <div style="text-align: right; font-family: var(--font-mono);">
                  <div style="font-size: 1.25rem; font-weight: 800; color: #f43f5e;">${boss.hpCurrent}% HP</div>
                  <div style="font-size: 0.6875rem; color: #94a3b8;">Reward: +${boss.bonusXP || 800} XP</div>
                </div>
              </div>

              <div class="boss-hp-bar">
                <div class="boss-hp-fill" style="width: ${boss.hpCurrent}%;"></div>
              </div>

              <!-- Boss requirements list -->
              <div style="margin-top: var(--space-4);">
                <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #cbd5e1; text-transform: uppercase; margin-bottom: var(--space-2); font-weight: 700;">
                  Damage Protocol Requirements:
                </div>
                <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                  ${(boss.requirements || []).map(req => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2-5) var(--space-3); background: rgba(0,0,0,0.4); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.08); cursor: pointer;" data-toggle-boss-req="${req.id}">
                      <div style="display: flex; align-items: center; gap: var(--space-2-5);">
                        <div style="width: 18px; height: 18px; border-radius: 4px; border: 1px solid ${req.completed ? 'var(--os-success)' : 'var(--os-border-light)'}; background: ${req.completed ? 'var(--os-success)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #ffffff;">
                          ${req.completed ? getIcon('check', 'w-3 h-3') : ''}
                        </div>
                        <span style="font-size: 0.8125rem; color: ${req.completed ? '#94a3b8' : '#ffffff'}; text-decoration: ${req.completed ? 'line-through' : 'none'};">
                          ${escapeHtml(req.text)}
                        </span>
                      </div>
                      <span class="badge ${req.completed ? 'badge-success' : 'badge-error'}">
                        ${req.completed ? '25% DMG Dealt' : 'Pending'}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : currentTab === 'achievements' ? `
            <!-- Achievements Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3);">
              ${(state.achievements || []).map(ach => `
                <div class="card" style="opacity: ${ach.unlocked ? '1' : '0.55'};">
                  <div style="display: flex; align-items: center; gap: var(--space-3);">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: ${ach.unlocked ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}; color: ${ach.unlocked ? '#fbbf24' : 'var(--os-text-subtle)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      ${getIcon(ach.icon || 'trophy', 'w-5 h-5')}
                    </div>
                    <div>
                      <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--os-text);">${escapeHtml(ach.title)}</h4>
                      <p style="font-size: 0.6875rem; color: var(--os-text-muted); margin-top: 2px;">${escapeHtml(ach.description)}</p>
                      <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; margin-top: 4px; font-weight: 700;">+${ach.xpReward} XP</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <!-- Reward Shop -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
              ${(state.rewards || []).map(rew => `
                <div class="card">
                  <h3 style="font-size: 1.0625rem; font-family: var(--font-display);">${escapeHtml(rew.name)}</h3>
                  <p style="font-size: 0.8125rem; color: var(--os-text-muted); margin: var(--space-2) 0;">${escapeHtml(rew.description)}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border); padding-top: var(--space-3); margin-top: var(--space-3);">
                    <span style="font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 800; color: #f59e0b;">${rew.xpCost} XP</span>
                    <button class="btn btn-secondary btn-xs" data-redeem-rew="${rew.id}">Redeem Reward</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  init(container) {
    // Tab switching
    container.querySelectorAll('[data-gamify-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playClick();
        this.currentTab = btn.getAttribute('data-gamify-tab');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Toggle Boss Requirement
    container.querySelectorAll('[data-toggle-boss-req]').forEach(row => {
      row.addEventListener('click', () => {
        const reqId = row.getAttribute('data-toggle-boss-req');
        store.setWeeklyBoss(prev => {
          const updated = (prev.requirements || []).map(r => r.id === reqId ? { ...r, completed: !r.completed } : r);
          const doneCount = updated.filter(r => r.completed).length;
          const newHP = Math.max(0, 100 - Math.round((doneCount / updated.length) * 100));

          if (newHP === 0) {
            awardXP(prev.bonusXP || 800, `Conquered Weekly Boss: ${prev.name}!`);
            triggerConfetti(120);
            soundService.playLevelUp();
            alert(`🎉 VICTORY! You have defeated ${prev.name}! +${prev.bonusXP} XP awarded.`);
          }

          return { ...prev, hpCurrent: newHP, requirements: updated };
        });

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Redeem reward
    container.querySelectorAll('[data-redeem-rew]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundService.playComplete();
        triggerConfetti(60);
        alert("🎉 Reward Claimed! Enjoy your guilt-free reward — you earned it.");
      });
    });
  },

  destroy() {}
};

export default gamificationApp;
