// COLLEGE OS - App: AI Study Buddy & Academic Coach

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const aiBuddyApp = {
  id: 'ai_buddy',
  title: 'AI Study Buddy & Coach',
  icon: 'bot',

  messages: [
    {
      sender: 'assistant',
      text: "Hello Alex! I am your College OS AI Study Buddy. How can I assist your deep work today? I can break down algorithms, summarize difficult math proofs, formulate study plans, or review your code."
    }
  ],

  render() {
    const suggestions = [
      "Explain SVD Decomposition simply",
      "Give me 3 practice DP questions",
      "Draft cold email to AI professor",
      "25-min Pomodoro focus plan"
    ];

    return `
      <div class="app-container" style="justify-content: space-between;">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>AI Study Buddy &amp; Coach</h2>
            <p>Your on-device cognitive tutor and research copilot.</p>
          </div>
          <span class="badge badge-success">Online • Ready</span>
        </div>

        <!-- Chat messages container -->
        <div class="chat-container">
          <div class="chat-messages" id="ai-chat-messages">
            ${this.messages.map(m => `
              <div class="chat-bubble ${m.sender}">
                ${escapeHtml(m.text)}
              </div>
            `).join('')}
          </div>

          <!-- Prompt chips -->
          <div style="display: flex; gap: var(--space-2); overflow-x: auto; padding: 4px 0;">
            ${suggestions.map(s => `
              <button class="btn btn-secondary btn-xs" data-prompt-chip="${escapeHtml(s)}" style="white-space: nowrap;">
                ${escapeHtml(s)}
              </button>
            `).join('')}
          </div>

          <!-- Input bar -->
          <form id="ai-chat-form" style="display: flex; gap: var(--space-2); position: relative;">
            <input type="text" id="ai-chat-input" class="form-input" placeholder="Ask anything about coursework, research, or study tactics..." autocomplete="off" />
            <button type="submit" class="btn btn-primary btn-sm" style="flex-shrink: 0;">
              Send
            </button>
          </form>
        </div>
      </div>
    `;
  },

  init(container) {
    const form = container.querySelector('#ai-chat-form');
    const input = container.querySelector('#ai-chat-input');
    const messagesEl = container.querySelector('#ai-chat-messages');

    const scrollToBottom = () => {
      if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    };
    scrollToBottom();

    const handleSendMessage = (text) => {
      if (!text || !text.trim()) return;
      this.messages.push({ sender: 'user', text: text.trim() });
      soundService.playClick();
      awardXP(10, "Consulted AI Study Buddy");

      // Generate context-aware response
      const query = text.toLowerCase();
      let reply = "That's a vital concept for your academic trajectory! Focus on foundational first-principles: write down the definitions, test with simple boundary cases (e.g. 0, 1, empty set), and construct a minimal mental model.";

      if (query.includes('svd') || query.includes('singular')) {
        reply = "Singular Value Decomposition (SVD) factors any matrix A as U * Σ * V^T. Think of it geometrically: V rotates the space, Σ stretches along the coordinate axes by singular values σ_i, and U performs a final rotation. It is the core mathematical engine behind PCA and dimensionality reduction!";
      } else if (query.includes('dp') || query.includes('dynamic programming')) {
        reply = "Here are 3 high-yield DP questions:\n1. Coin Change (1D DP, unbounded knapsack pattern)\n2. Longest Common Subsequence (2D state grid, string alignment)\n3. Word Break (Interval / prefix memoization).\nAlways identify: state variables, base case, and recurrence relation!";
      } else if (query.includes('cold email') || query.includes('professor')) {
        reply = "Cold Email Framework:\n1. Specific Hook: Mention a specific paper or recent finding they published.\n2. Proof of Competency: 1 sentence highlighting your relevant project (e.g., PyTorch models or College OS).\n3. Clear, low-friction ask: 15-minute conversation or reading recommendation.";
      } else if (query.includes('pomodoro') || query.includes('plan')) {
        reply = "25-Minute Execution Protocol:\n• 0-3 min: Eliminate all tabs except task documentation.\n• 3-22 min: Deep implementation sprint without touching the phone.\n• 22-25 min: Commit code or write 2-bullet summary.";
      }

      setTimeout(() => {
        this.messages.push({ sender: 'assistant', text: reply });
        soundService.playComplete();
        container.innerHTML = this.render();
        this.init(container);
      }, 450);

      container.innerHTML = this.render();
      this.init(container);
    };

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      input.value = '';
      handleSendMessage(val);
    });

    container.querySelectorAll('[data-prompt-chip]').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-prompt-chip');
        handleSendMessage(text);
      });
    });
  },

  destroy() {}
};

export default aiBuddyApp;
