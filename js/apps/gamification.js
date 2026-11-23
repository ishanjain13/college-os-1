// COLLEGE OS - App: Gamification, Weekly Boss Battle & Achievements

import store from '../state.js';
import { calculateLevelInfo, awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import { triggerConfetti } from '../confetti.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

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
              ${getIcon('trophy', 'w-3.5 h-3.5')} Badges (${(state.achievements || []).filter(a => a.unlocked).length})
            </button>
            <button class="tab-btn ${currentTab === 'shop' ? 'active' : ''}" data-gamify-tab="shop">
              ${getIcon('sparkles', 'w-3.5 h-3.5')} Reward Shop (${state.profile.totalXP} XP)
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="app-body">
          ${currentTab === 'boss' ? `
            <!-- Boss Card -->
            <div class="boss-card" style="background: linear-gradient(135deg, rgba(120,53,15,0.3) 0%, var(--os-bg-card) 100%); border: 1px solid rgba(245,158,11,0.3); border-radius: var(--radius-2xl); padding: var(--space-6);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); flex-wrap: wrap;">
                <div>
                  <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; font-weight: 700; text-transform: uppercase;">
                    WEEKLY MOMENTUM RAID BOSS
                  </div>
                  <h3 style="font-size: 1.5rem; font-family: var(--font-display); color: #ffffff; margin: 4px 0;">
                    ${escapeHtml(boss.name)}
                  </h3>
                  <p style="font-size: 0.8125rem; color: #cbd5e1;">${escapeHtml(boss.subtitle || 'Midterm Readiness Gatekeeper')}</p>
                </div>
                <div style="text-align: right; font-family: var(--font-mono);">
                  <div style="font-size: 1.5rem; font-weight: 900; color: ${boss.hpCurrent === 0 ? 'var(--os-success)' : '#f43f5e'};">
                    ${boss.hpCurrent}% HP
                  </div>
                  <div style="font-size: 0.6875rem; color: #94a3b8;">Bounty: +${boss.bonusXP || 800} XP</div>
                </div>
              </div>

              <div class="progress-bar-container" style="height: 10px; margin-top: var(--space-4);">
                <div class="progress-bar-fill" style="width: ${boss.hpCurrent}%; background: linear-gradient(90deg, #f43f5e, #fb7185);"></div>
              </div>

              <!-- Boss requirements list -->
              <div style="margin-top: var(--space-5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                  <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #cbd5e1; text-transform: uppercase; font-weight: 700;">
                    Raid Battle Requirements (${(boss.requirements || []).filter(r => r.completed).length}/${(boss.requirements || []).length} Conquered):
                  </div>
                  <button class="btn btn-ghost btn-xs" id="btn-add-boss-req">+ Add Requirement</button>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                  ${(boss.requirements || []).map(req => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2-5) var(--space-3); background: rgba(0,0,0,0.4); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.08); gap: var(--space-2);">
                      <div style="display: flex; align-items: center; gap: var(--space-2-5); cursor: pointer; flex: 1;" data-toggle-boss-req="${req.id}">
                        <div style="width: 18px; height: 18px; border-radius: 4px; border: 1px solid ${req.completed ? 'var(--os-success)' : 'var(--os-border-light)'}; background: ${req.completed ? 'var(--os-success)' : 'transparent'}; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;">
                          ${req.completed ? getIcon('check', 'w-3 h-3') : ''}
                        </div>
                        <span style="font-size: 0.8125rem; color: ${req.completed ? '#94a3b8' : '#ffffff'}; text-decoration: ${req.completed ? 'line-through' : 'none'};">
                          ${escapeHtml(req.text)}
                        </span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span class="badge ${req.completed ? 'badge-success' : 'badge-error'}">
                          ${req.completed ? 'DMG Dealt' : 'Pending'}
                        </span>
                        <button class="btn btn-ghost btn-xs" data-del-boss-req="${req.id}">×</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : currentTab === 'achievements' ? `
            <!-- Achievements Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3);">
              ${(state.achievements || []).map(ach => `
                <div class="card" style="opacity: ${ach.unlocked ? '1' : '0.55'}; border-left: 3px solid ${ach.unlocked ? 'var(--os-warning)' : 'var(--os-border)'};">
                  <div style="display: flex; align-items: center; gap: var(--space-3);">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: ${ach.unlocked ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}; color: ${ach.unlocked ? '#fbbf24' : 'var(--os-text-subtle)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      ${getIcon(ach.icon || 'trophy', 'w-5 h-5')}
                    </div>
                    <div>
                      <h4 style="font-size: 0.875rem; font-weight: 700; color: var(--os-text);">${escapeHtml(ach.title)}</h4>
                      <p style="font-size: 0.6875rem; color: var(--os-text-muted); margin-top: 2px;">${escapeHtml(ach.description)}</p>
                      <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: #f59e0b; margin-top: 4px; font-weight: 700;">
                        ${ach.unlocked ? '✓ Unlocked' : `+${ach.xpReward} XP`}
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <!-- Reward Shop -->
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.8125rem; color: var(--os-text-muted);">
                  Available XP Balance: <strong style="color: #f59e0b; font-family: var(--font-mono); font-size: 1rem;">${state.profile.totalXP} XP</strong>
                </div>
                <button class="btn btn-primary btn-sm" id="btn-add-reward">
                  ${getIcon('plus', 'w-3.5 h-3.5')} Custom Reward
                </button>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
                ${(state.rewards || []).map(rew => {
                  const canAfford = state.profile.totalXP >= rew.xpCost;
                  return `
                    <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
                      <div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <h3 style="font-size: 1.0625rem; font-family: var(--font-display);">${escapeHtml(rew.name)}</h3>
                          <button class="btn btn-ghost btn-xs" data-del-reward="${rew.id}">×</button>
                        </div>
                        <p style="font-size: 0.8125rem; color: var(--os-text-muted); margin: var(--space-2) 0;">${escapeHtml(rew.description)}</p>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--os-border); padding-top: var(--space-3); margin-top: var(--space-3);">
                        <span style="font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 800; color: #f59e0b;">${rew.xpCost} XP</span>
                        <button class="btn ${canAfford ? 'btn-primary' : 'btn-secondary'} btn-xs" data-redeem-rew="${rew.id}" ${canAfford ? '' : 'disabled'}>
                          ${canAfford ? 'Redeem Reward' : 'Need More XP'}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
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
    container.querySelectorAll('[data-toggle-boss-req]').forEach(el => {
      el.addEventListener('click', () => {
        const reqId = el.getAttribute('data-toggle-boss-req');
        store.setWeeklyBoss(prev => {
          const updated = (prev.requirements || []).map(r => r.id === reqId ? { ...r, completed: !r.completed } : r);
          const doneCount = updated.filter(r => r.completed).length;
          const total = Math.max(1, updated.length);
          const newHP = Math.max(0, 100 - Math.round((doneCount / total) * 100));

          if (newHP === 0 && prev.hpCurrent > 0) {
            triggerConfetti(140);
            soundService.playLevelUp();
            logActivity({
              appId: 'achievements',
              action: 'boss_slain',
              title: `Conquered Weekly Boss: ${prev.name}!`,
              details: `Claimed ${prev.bonusXP || 800} XP victory bounty`,
              xpEarned: prev.bonusXP || 800
            });
            ui.toast({
              title: '👑 RAID BOSS SLAYED!',
              message: `You defeated ${prev.name}! +${prev.bonusXP || 800} XP awarded!`,
              type: 'success'
            });
          }

          return { ...prev, hpCurrent: newHP, requirements: updated };
        });

        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Add Boss Requirement
    container.querySelector('#btn-add-boss-req')?.addEventListener('click', () => {
      ui.modal({
        title: 'Add Raid Damage Requirement',
        width: '400px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Objective Description</label>
            <input type="text" id="modal-boss-req" class="form-input" placeholder="e.g. Complete 5 Pomodoro focus blocks" />
          </div>
        `,
        confirmText: 'Add Objective',
        onConfirm: (modalEl) => {
          const text = modalEl.querySelector('#modal-boss-req')?.value.trim();
          if (!text) return false;
          store.setWeeklyBoss(prev => {
            const reqs = [...(prev.requirements || []), { id: `br-${Date.now()}`, text, completed: false }];
            const doneCount = reqs.filter(r => r.completed).length;
            const newHP = Math.max(0, 100 - Math.round((doneCount / reqs.length) * 100));
            return { ...prev, requirements: reqs, hpCurrent: newHP };
          });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Delete Boss Req
    container.querySelectorAll('[data-del-boss-req]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-boss-req');
        store.setWeeklyBoss(prev => {
          const reqs = (prev.requirements || []).filter(r => r.id !== id);
          const doneCount = reqs.filter(r => r.completed).length;
          const newHP = reqs.length > 0 ? Math.max(0, 100 - Math.round((doneCount / reqs.length) * 100)) : 100;
          return { ...prev, requirements: reqs, hpCurrent: newHP };
        });
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Add Custom Reward
    container.querySelector('#btn-add-reward')?.addEventListener('click', () => {
      ui.modal({
        title: 'Create Guilt-Free Reward',
        width: '420px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Reward Name *</label>
            <input type="text" id="modal-rew-name" class="form-input" placeholder="e.g. Favorite Restaurant Dinner" />
          </div>
          <div class="form-group">
            <label class="form-label">XP Cost *</label>
            <input type="number" id="modal-rew-cost" class="form-input" value="1000" min="50" step="50" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea id="modal-rew-desc" class="form-textarea" placeholder="Celebrate your effort with zero guilt..."></textarea>
          </div>
        `,
        confirmText: 'Add to Shop',
        onConfirm: (modalEl) => {
          const name = modalEl.querySelector('#modal-rew-name')?.value.trim();
          if (!name) return false;
          const xpCost = Number(modalEl.querySelector('#modal-rew-cost')?.value) || 500;
          const description = modalEl.querySelector('#modal-rew-desc')?.value.trim() || '';

          const newRew = { id: `rew-${Date.now()}`, name, xpCost, description };
          store.setRewards(prev => [...prev, newRew]);
          ui.toast({ title: 'Reward Added', message: `Added ${name} to shop.`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Delete Reward
    container.querySelectorAll('[data-del-reward]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del-reward');
        store.setRewards(prev => prev.filter(r => r.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Redeem Reward
    container.querySelectorAll('[data-redeem-rew]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-redeem-rew');
        const rew = store.get().rewards.find(r => r.id === id);
        if (!rew) return;

        const currentXP = store.get().profile.totalXP;
        if (currentXP < rew.xpCost) {
          ui.toast({ title: 'Insufficient XP', message: `You need ${rew.xpCost - currentXP} more XP to claim this reward.`, type: 'warning' });
          return;
        }

        ui.confirm({
          title: `Redeem "${rew.name}"?`,
          message: `This will deduct ${rew.xpCost} XP from your balance (${currentXP} XP -> ${currentXP - rew.xpCost} XP). Enjoy your reward guilt-free!`,
          confirmText: `Spend ${rew.xpCost} XP`,
          confirmClass: 'btn-primary',
          onConfirm: () => {
            store.updateProfile({ totalXP: currentXP - rew.xpCost });
            triggerConfetti(80);
            soundService.playComplete();
            logActivity({
              appId: 'achievements',
              action: 'reward_redeemed',
              title: `Redeemed Reward: ${rew.name}`,
              details: `Spent ${rew.xpCost} XP`,
              xpEarned: 0
            });
            ui.toast({ title: 'Reward Claimed! 🎁', message: `Enjoy "${rew.name}"! Well earned.`, type: 'success' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });
  },

  destroy() {}
};

export default gamificationApp;
