// COLLEGE OS - App: Campus Life & Virtual Study Room

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const campusApp = {
  id: 'campus',
  title: 'Campus Life & Room',
  icon: 'users',

  render() {
    const students = [
      { name: "Alex (You)", college: "Stanford", task: "CS 229 Midterm & College OS", duration: "75 min active", status: "Focusing" },
      { name: "Elena V.", college: "MIT", task: "Algorithm Graph Workshop", duration: "110 min active", status: "Focusing" },
      { name: "Marcus Chen", college: "UC Berkeley", task: "PyTorch Transformer Tuning", duration: "45 min active", status: "Focusing" },
      { name: "Sarah Miller", college: "CMU", task: "Linear Algebra & SVD Problems", duration: "90 min active", status: "Break" }
    ];

    const events = [
      { name: "Stanford AI Symposium & Research Poster Session", date: "Nov 28, 2026", room: "Huang Engineering Center" },
      { name: "Campus Hackathon 2026", date: "Dec 04, 2026", room: "Gates Computer Science Building" },
      { name: "Tech Career & Internship Expo", date: "Dec 12, 2026", room: "Tresidder Student Union" }
    ];

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Campus Life &amp; Virtual Study Room</h2>
            <p>Peer accountability room and campus events directory.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-checkin-room">
            ${getIcon('users', 'w-3.5 h-3.5')} Check In to Room (+25 XP)
          </button>
        </div>

        <div class="app-body">
          <!-- Active Study Room Grid -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Live Study Room Peers (Silent Flow State)</span>
              <span class="badge badge-success">4 Scholars Connected</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3);">
              ${students.map(s => `
                <div style="background: var(--os-bg-subtle); border: 1px solid var(--os-border); border-radius: var(--radius-md); padding: var(--space-3);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-weight: 700; font-size: 0.8125rem;">${escapeHtml(s.name)}</span>
                    <span class="badge ${s.status === 'Focusing' ? 'badge-primary' : 'badge-warning'}">${s.status}</span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--os-text-muted);">${escapeHtml(s.task)}</div>
                  <div style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 6px;">
                    ${escapeHtml(s.college)} • ${s.duration}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Campus Events -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Upcoming Campus Events</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${events.map(ev => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2-5) var(--space-3); background: var(--os-bg-subtle); border-radius: var(--radius-md);">
                  <div>
                    <div style="font-weight: 600; font-size: 0.8125rem;">${escapeHtml(ev.name)}</div>
                    <div style="font-size: 0.6875rem; color: var(--os-text-muted);">${escapeHtml(ev.room)}</div>
                  </div>
                  <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-accent); font-weight: 600;">${ev.date}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    const checkinBtn = container.querySelector('#btn-checkin-room');
    checkinBtn?.addEventListener('click', (e) => {
      awardXP(25, "Virtual Study Room Check-In", e.clientX, e.clientY);
      alert("✓ Connected to Virtual Study Room. Focus sprint commenced.");
    });
  },

  destroy() {}
};

export default campusApp;
