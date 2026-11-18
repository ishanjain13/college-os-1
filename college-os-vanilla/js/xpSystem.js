// COLLEGE OS - Gamification, XP Engine & Level-Up Celebrations

import store, { DEFAULT_LEVEL_TIERS } from './state.js';
import soundService from './sound.js';
import { triggerConfetti } from './confetti.js';
import { getIcon } from './icons.js';

export function calculateLevelInfo(totalXP, customTiers = DEFAULT_LEVEL_TIERS) {
  let currentLevel = 1;
  let currentTitle = customTiers[0].title;
  let nextLevelXP = 500;
  let prevLevelXP = 0;

  for (let lvl = 1; lvl <= 100; lvl++) {
    const requiredXP = Math.floor(250 * Math.pow(lvl, 1.35));
    if (totalXP >= requiredXP) {
      currentLevel = lvl + 1;
      prevLevelXP = requiredXP;
    } else {
      nextLevelXP = requiredXP;
      break;
    }
  }

  for (let i = customTiers.length - 1; i >= 0; i--) {
    if (currentLevel >= customTiers[i].level) {
      currentTitle = customTiers[i].title;
      break;
    }
  }

  const xpInCurrentLevel = totalXP - prevLevelXP;
  const xpNeededForLevel = Math.max(1, nextLevelXP - prevLevelXP);
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)));

  return {
    level: currentLevel,
    title: currentTitle,
    totalXP,
    xpInCurrentLevel,
    xpNeededForLevel,
    progressPercent,
    nextLevelXP
  };
}

export function awardXP(amount, reason = 'Action Completed', clientX = null, clientY = null) {
  if (!amount || amount <= 0) return;

  const prevState = store.get();
  const oldXP = prevState.profile.totalXP;
  const newXP = oldXP + amount;
  const oldLvl = calculateLevelInfo(oldXP, prevState.levelTiers);
  const newLvl = calculateLevelInfo(newXP, prevState.levelTiers);

  soundService.playComplete();
  store.updateProfile({ totalXP: newXP });

  // Floating +XP animation
  showFloatingXP(amount, clientX, clientY);

  // Check Level-Up condition
  if (newLvl.level > oldLvl.level) {
    soundService.playLevelUp();
    triggerConfetti(120);
    showLevelUpModal(newLvl);
  }
}

function showFloatingXP(amount, x, y) {
  const el = document.createElement('div');
  el.className = 'floating-xp';
  el.textContent = `+${amount} XP`;

  const posX = x !== null ? x : window.innerWidth / 2;
  const posY = y !== null ? y : window.innerHeight / 2;

  el.style.left = `${posX}px`;
  el.style.top = `${posY}px`;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

export function showLevelUpModal(lvlInfo) {
  let modal = document.getElementById('level-up-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'level-up-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card" style="text-align: center; border-color: #f59e0b; background: linear-gradient(180deg, rgba(120,53,15,0.3) 0%, var(--os-bg-modal) 100%);">
      <div style="width: 80px; height: 80px; margin: 0 auto var(--space-4); border-radius: 24px; background: linear-gradient(135deg, #f59e0b, #fbbf24); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(245,158,11,0.4);">
        ${getIcon('crown', 'w-10 h-10', 40)}
      </div>
      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #fbbf24; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Level Up Achieved!</div>
      <h2 style="font-size: 2rem; margin: var(--space-2) 0; font-family: var(--font-display);">Level ${lvlInfo.level}</h2>
      <p style="color: var(--os-text-muted); font-size: 0.875rem; margin-bottom: var(--space-5);">New Rank Title: <strong style="color: #ffffff;">${lvlInfo.title}</strong></p>
      <button class="btn btn-primary btn-md" style="background: #f59e0b; border-color: #fbbf24; color: #000000; font-weight: 700;" id="close-levelup-btn">
        Claim Rewards &amp; Continue
      </button>
    </div>
  `;

  modal.classList.add('open');
  modal.querySelector('#close-levelup-btn').onclick = () => {
    soundService.playClick();
    modal.classList.remove('open');
  };
}

export function showAchievementToast(ach) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(245,158,11,0.2); border: 1px solid rgba(245,158,11,0.4); display: flex; align-items: center; justify-content: center; color: #fbbf24; flex-shrink: 0;">
      ${getIcon(ach.icon || 'trophy', 'w-5 h-5')}
    </div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-family: var(--font-mono); font-size: 0.625rem; font-weight: 700; color: #fbbf24; text-transform: uppercase;">Achievement Unlocked</div>
      <div style="font-size: 0.8125rem; font-weight: 700; color: #ffffff; margin-top: 2px;">${ach.title}</div>
      <div style="font-size: 0.6875rem; color: #94a3b8; margin-top: 2px;">${ach.description}</div>
    </div>
    <div style="font-family: var(--font-mono); font-size: 0.6875rem; font-weight: 700; color: #fbbf24; background: rgba(245,158,11,0.15); padding: 2px 6px; border-radius: 6px;">
      +${ach.xpReward || 100} XP
    </div>
    <div class="toast-progress-bar"></div>
  `;

  container.appendChild(toast);
  soundService.playAchievement();
  triggerConfetti(60);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(60px)';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}
