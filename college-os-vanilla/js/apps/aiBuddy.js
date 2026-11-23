// COLLEGE OS - App: AI Study Buddy & Academic Coach
// Powered by Local Knowledge Engine + Optional Live Google Gemini API

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

function renderMarkdown(text) {
  if (!text) return '';
  const codeBlocks = [];
  let processed = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code class="lang-${escapeHtml(lang)}">${escapeHtml(code.trim())}</code></pre>`);
    return `__CODE_BLOCK_${idx}__`;
  });

  processed = escapeHtml(processed);

  codeBlocks.forEach((block, idx) => {
    processed = processed.replace(`__CODE_BLOCK_${idx}__`, block);
  });

  processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  processed = processed.replace(/^### (.*$)/gim, '<h4 style="margin: 8px 0 4px; font-weight: 700; color: var(--os-accent);">$1</h4>');
  processed = processed.replace(/^## (.*$)/gim, '<h3 style="margin: 10px 0 6px; font-weight: 700;">$1</h3>');
  processed = processed.replace(/^# (.*$)/gim, '<h2 style="margin: 12px 0 8px; font-weight: 700;">$1</h2>');
  processed = processed.replace(/^\s*[-*•]\s+(.*$)/gim, '<li>$1</li>');
  processed = processed.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  processed = processed.replace(/<\/ul>\s*<ul>/g, '');
  processed = processed.replace(/\n\n/g, '<div style="height: 8px;"></div>');
  processed = processed.replace(/\n/g, '<br/>');

  return processed;
}

function buildContextSummary(attachedSet, state) {
  const parts = [];
  if (attachedSet.has('timetable')) {
    const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayClasses = (state.timetable || []).filter(c => c.day === todayDay);
    const classesText = todayClasses.length
      ? todayClasses.map(c => `${c.course} (${c.time}, ${c.room}, Prof. ${c.professor})`).join('; ')
      : 'No classes today';
    const attText = (state.attendance || []).map(a => `${a.course}: ${a.attended}/${a.totalClasses} (${a.percentage}%)`).join(', ');
    parts.push(`Today is ${todayDay}. Scheduled classes: ${classesText}. Attendance record: ${attText}`);
  }

  if (attachedSet.has('tasks')) {
    const pendingTasks = (state.kanbanCards || []).filter(t => t.column !== 'Done').slice(0, 6);
    parts.push(`Pending Tasks: ${pendingTasks.length ? pendingTasks.map(t => `${t.title} [Priority: ${t.priority}, Due: ${t.deadline || 'None'}]`).join('; ') : 'All tasks completed'}`);
  }

  if (attachedSet.has('goals')) {
    const goals = (state.goals || []).slice(0, 4);
    parts.push(`Active Goals: ${goals.length ? goals.map(g => `${g.title} (${g.current}/${g.target} ${g.unit || ''}, Due: ${g.deadline || 'None'})`).join('; ') : 'No active goals'}`);
  }

  if (attachedSet.has('notes')) {
    const notes = (state.notes || []).slice(0, 4);
    parts.push(`Recent Notes: ${notes.length ? notes.map(n => `"${n.title}" (${n.subject})`).join('; ') : 'No notes written'}`);
  }

  if (attachedSet.has('academics')) {
    const gpa = state.grades?.cgpa || '3.82';
    const exams = (state.exams || []).slice(0, 3);
    parts.push(`Current CGPA: ${gpa}. Upcoming Exams: ${exams.length ? exams.map(e => `${e.subject} on ${e.date}`).join('; ') : 'No upcoming exams'}`);
  }

  return parts.join('\n');
}

export const aiBuddyApp = {
  id: 'ai_buddy',
  title: 'AI Study Buddy & Coach',
  icon: 'bot',

  attachedContexts: new Set(['timetable', 'tasks']),
  isGenerating: false,

  getMessages() {
    const state = store.get();
    const history = state.aiChatHistory || [];
    if (history.length > 0) return history;

    const profile = state.profile || {};
    return [
      {
        id: 'msg-init',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        text: `Hello ${profile.name || 'there'}! I am your College OS AI Study Buddy & Academic Coach.\n\nI can break down complex lecture concepts, formulate high-yield study plans, review problem sets, explain algorithms, and help keep your GPA on track.\n\n**Quick Tips:**\n- Use the **context pills** below to attach your active schedule, tasks, or notes.\n- Connect a free **Google Gemini API key** in the header for live multimodal intelligence, or use the built-in on-device tutor anytime!`
      }
    ];
  },

  render() {
    const state = store.get();
    const aiSettings = state.aiSettings || { apiKey: '', model: 'gemini-1.5-flash', enabled: false };
    const hasApiKey = Boolean(aiSettings.apiKey && aiSettings.apiKey.trim());
    const messages = this.getMessages();

    const suggestions = [
      "Analyze today's schedule & focus blocks",
      "Explain SVD Decomposition simply",
      "Give me 3 practice DP questions",
      "How to raise my GPA this semester?",
      "Draft cold email to research professor"
    ];

    const contextOptions = [
      { id: 'timetable', label: 'Timetable & Attendance', icon: 'clock' },
      { id: 'tasks', label: 'Kanban Tasks', icon: 'check-square' },
      { id: 'goals', label: 'Semester Goals', icon: 'target' },
      { id: 'notes', label: 'Recent Notes', icon: 'book-open' },
      { id: 'academics', label: 'CGPA & Exams', icon: 'award' }
    ];

    return `
      <div class="app-container" style="justify-content: space-between; height: 100%;">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <h2>AI Study Buddy &amp; Coach</h2>
              ${hasApiKey ? `
                <span class="badge badge-success" style="cursor: pointer;" id="btn-header-ai-status" title="Gemini API Connected • Click to manage">
                  ${getIcon('zap', 'w-3 h-3')} ${escapeHtml(aiSettings.model || 'Gemini')}
                </span>
              ` : `
                <span class="badge badge-secondary" style="cursor: pointer; border: 1px dashed var(--os-border-strong);" id="btn-header-ai-status" title="Using Local Tutor • Click to connect Gemini API">
                  ${getIcon('bot', 'w-3 h-3')} Local Coach (Click to connect Gemini)
                </span>
              `}
            </div>
            <p>Your cognitive tutor, schedule strategist, and academic co-pilot.</p>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <button class="btn btn-secondary btn-xs" id="btn-ai-config" title="Configure AI Settings & API Key">
              ${getIcon('settings', 'w-3.5 h-3.5')} AI Settings
            </button>
            <button class="btn btn-ghost btn-xs" id="btn-ai-clear" title="Clear Conversation History">
              ${getIcon('trash-2', 'w-3.5 h-3.5')}
            </button>
          </div>
        </div>

        <!-- Chat messages container -->
        <div class="chat-container">
          <div class="chat-messages" id="ai-chat-messages">
            ${messages.map(m => `
              <div class="chat-bubble ${m.sender === 'user' ? 'user' : 'assistant'}">
                ${m.contextAttached ? `
                  <div style="font-size: 0.6875rem; opacity: 0.85; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.25);">
                    📎 Attached Context: ${escapeHtml(m.contextAttached)}
                  </div>
                ` : ''}
                ${m.sender === 'user' ? escapeHtml(m.text) : renderMarkdown(m.text)}
              </div>
            `).join('')}

            ${this.isGenerating ? `
              <div class="chat-bubble assistant">
                <div class="chat-typing-indicator">
                  <div class="chat-typing-dot"></div>
                  <div class="chat-typing-dot"></div>
                  <div class="chat-typing-dot"></div>
                  <span style="font-size: 0.6875rem; color: var(--os-text-muted); margin-left: 6px;">AI Coach is synthesizing response...</span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Context Pill Attachment Selector -->
          <div style="display: flex; flex-direction: column; gap: var(--space-1); background: var(--os-bg-card); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--os-border);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.6875rem; color: var(--os-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                Context Attachments (${this.attachedContexts.size} active)
              </span>
              <span style="font-size: 0.6875rem; color: var(--os-text-subtle);">Injects real live data into study queries</span>
            </div>
            <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
              ${contextOptions.map(opt => {
                const isActive = this.attachedContexts.has(opt.id);
                return `
                  <button class="context-pill ${isActive ? 'active' : ''}" data-context-toggle="${opt.id}" type="button">
                    ${getIcon(opt.icon, 'w-3 h-3')}
                    <span>${opt.label}</span>
                    <span style="font-weight: 700; margin-left: 2px;">${isActive ? '✓' : '+'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Prompt chips -->
          <div style="display: flex; gap: var(--space-2); overflow-x: auto; padding: 2px 0;">
            ${suggestions.map(s => `
              <button class="btn btn-secondary btn-xs" data-prompt-chip="${escapeHtml(s)}" style="white-space: nowrap;">
                ${escapeHtml(s)}
              </button>
            `).join('')}
          </div>

          <!-- Input bar -->
          <form id="ai-chat-form" style="display: flex; gap: var(--space-2); position: relative;">
            <input type="text" id="ai-chat-input" class="form-input" placeholder="Ask anything about coursework, algorithms, schedule, or study tactics..." autocomplete="off" ${this.isGenerating ? 'disabled' : ''} />
            <button type="submit" class="btn btn-primary btn-sm" style="flex-shrink: 0;" ${this.isGenerating ? 'disabled' : ''}>
              ${this.isGenerating ? 'Synthesizing...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    `;
  },

  init(container) {
    this.container = container;
    const form = container.querySelector('#ai-chat-form');
    const input = container.querySelector('#ai-chat-input');
    const messagesEl = container.querySelector('#ai-chat-messages');

    const scrollToBottom = () => {
      if (messagesEl) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    };
    scrollToBottom();

    // Context toggle pills
    container.querySelectorAll('[data-context-toggle]').forEach(pill => {
      pill.addEventListener('click', () => {
        soundService.playClick();
        const ctxId = pill.getAttribute('data-context-toggle');
        if (this.attachedContexts.has(ctxId)) {
          this.attachedContexts.delete(ctxId);
        } else {
          this.attachedContexts.add(ctxId);
        }
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Header buttons
    container.querySelector('#btn-header-ai-status')?.addEventListener('click', () => this.openConfigModal());
    container.querySelector('#btn-ai-config')?.addEventListener('click', () => this.openConfigModal());

    // Clear history button
    container.querySelector('#btn-ai-clear')?.addEventListener('click', () => {
      ui.confirm('Clear all conversation history? This cannot be undone.', () => {
        soundService.playClick();
        store.setAiChatHistory(() => []);
        ui.toast('Chat history cleared');
        container.innerHTML = this.render();
        this.init(container);
      });
    });

    // Prompt chips
    container.querySelectorAll('[data-prompt-chip]').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-prompt-chip');
        if (input) input.value = text;
        this.handleSendMessage(text);
      });
    });

    // Form submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      this.handleSendMessage(val);
    });
  },

  openConfigModal() {
    const state = store.get();
    const current = state.aiSettings || { apiKey: '', model: 'gemini-1.5-flash', enabled: false };

    ui.modal({
      title: 'Configure Google Gemini API',
      content: `
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <p style="font-size: 0.8125rem; color: var(--os-text-muted); line-height: 1.5;">
            Connect your personal Google Gemini API key to unlock live multimodal AI reasoning, deep question answering, and automated study analysis.
          </p>
          <div class="form-group">
            <label class="form-label">Gemini API Key</label>
            <input type="password" id="modal-gemini-key" class="form-input" placeholder="AIzaSy..." value="${escapeHtml(current.apiKey || '')}" autocomplete="off" />
            <div style="font-size: 0.6875rem; color: var(--os-text-subtle); margin-top: 4px;">
              Get a free API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="color: var(--os-accent); text-decoration: underline;">Google AI Studio</a>. Keys are stored ONLY in local browser storage and never exported in backups.
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Model Selection</label>
            <select id="modal-gemini-model" class="form-select">
              <option value="gemini-1.5-flash" ${current.model === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash (Fast, Low Latency, Recommended)</option>
              <option value="gemini-1.5-pro" ${current.model === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro (Deep Reasoning &amp; Complex Analysis)</option>
            </select>
          </div>
        </div>
      `,
      confirmText: 'Save Key',
      onConfirm: () => {
        const key = document.getElementById('modal-gemini-key')?.value.trim() || '';
        const model = document.getElementById('modal-gemini-model')?.value || 'gemini-1.5-flash';
        store.setAiSettings({ apiKey: key, model, enabled: Boolean(key) });
        ui.toast(key ? 'Gemini API key saved successfully!' : 'API key removed. Running local tutor mode.');
        if (this.container) {
          this.container.innerHTML = this.render();
          this.init(this.container);
        }
      }
    });
  },

  async handleSendMessage(text) {
    if (!text || !text.trim() || this.isGenerating) return;
    const cleanText = text.trim();
    const state = store.get();
    const aiSettings = state.aiSettings || {};
    const hasApiKey = Boolean(aiSettings.apiKey && aiSettings.apiKey.trim());

    // Build context string if attached
    const contextText = buildContextSummary(this.attachedContexts, state);
    const contextLabel = Array.from(this.attachedContexts).join(', ');

    // Add user message
    const userMsg = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toISOString(),
      contextAttached: this.attachedContexts.size > 0 ? contextLabel : null
    };

    store.setAiChatHistory(prev => [...prev, userMsg]);
    soundService.playClick();

    this.isGenerating = true;
    if (this.container) {
      this.container.innerHTML = this.render();
      this.init(this.container);
    }

    try {
      let replyText = '';
      if (hasApiKey) {
        replyText = await this.callGemini(cleanText, contextText, aiSettings);
      } else {
        // Fall back to intelligent local academic engine
        await new Promise(r => setTimeout(r, 600)); // natural cognitive pause
        replyText = this.generateLocalResponse(cleanText, contextText, state);
      }

      const assistantMsg = {
        id: `msg-a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString()
      };

      store.setAiChatHistory(prev => [...prev, assistantMsg]);
      soundService.playComplete();
      awardXP(15, 'Consulted AI Study Buddy');
      logActivity({
        appId: 'ai_buddy',
        action: 'query',
        title: 'Consulted AI Study Buddy',
        details: cleanText.length > 50 ? cleanText.slice(0, 47) + '...' : cleanText,
        xpEarned: 15
      });
    } catch (err) {
      console.error('AI Buddy API error:', err);
      const errorMsg = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `**AI Connection Notice:**\n${err.message || 'Unable to connect to Gemini API.'}\n\nFalling back to local coach mode:\n\n` + this.generateLocalResponse(cleanText, contextText, state),
        timestamp: new Date().toISOString()
      };
      store.setAiChatHistory(prev => [...prev, errorMsg]);
      soundService.playAlert();
    } finally {
      this.isGenerating = false;
      if (this.container) {
        this.container.innerHTML = this.render();
        this.init(this.container);
      }
    }
  },

  async callGemini(userText, contextText, settings) {
    const apiKey = settings.apiKey;
    const model = settings.model || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const state = store.get();
    const history = (state.aiChatHistory || []).slice(-6); // last 6 turns for context
    const contents = [];

    // Prior history turns
    history.forEach(m => {
      if (m.sender === 'user') {
        contents.push({ role: 'user', parts: [{ text: m.text }] });
      } else if (m.sender === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: m.text }] });
      }
    });

    // Current turn with injected context
    let promptPayload = userText;
    if (contextText) {
      promptPayload = `[LIVE COLLEGE OS CONTEXT]\n${contextText}\n\n[STUDENT QUERY]\n${userText}`;
    }
    contents.push({ role: 'user', parts: [{ text: promptPayload }] });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{
            text: "You are College OS AI Study Buddy and Academic Coach. You are an expert STEM and university academic tutor. Keep answers structured, insightful, clear, and pedagogical. Use markdown formatting with bold text, bullet points, and code formatting where applicable."
          }]
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(`Gemini API Error: ${msg}`);
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResult) {
      throw new Error('Received empty response from Gemini API.');
    }
    return textResult;
  },

  generateLocalResponse(query, contextText, state) {
    const q = query.toLowerCase();

    // 1. Schedule / classes / today
    if (q.includes('schedule') || q.includes('class') || q.includes('today') || q.includes('timetable')) {
      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const todayClasses = (state.timetable || []).filter(c => c.day === todayDay);
      if (todayClasses.length === 0) {
        return `**Today's Schedule (${todayDay}):**\n\nYou have no scheduled lectures today! This is an ideal high-yield day for uninterrupted **deep work**.\n\n### Strategic Recommendation:\n1. Dedicate a 90-minute morning sprint to your highest priority assignment.\n2. Complete 1 LeetCode problem or technical practice.\n3. Review flashcards before evening relaxation.`;
      }
      return `**Today's Schedule (${todayDay}):**\n\nYou have **${todayClasses.length} lecture(s)** scheduled today:\n${todayClasses.map(c => `- **${c.course}**: ${c.time} in room ${c.room} (Prof. ${c.professor})`).join('\n')}\n\n### Study Block Strategy:\n• Protect the 45-minute gaps between lectures for active recall or reading slides.\n• Ensure you attend all lectures to preserve your attendance buffer.`;
    }

    // 2. Attendance / bunking
    if (q.includes('attendance') || q.includes('bunk') || q.includes('safe miss') || q.includes('threshold')) {
      const threshold = (state.profile?.attendanceThreshold || 75) / 100;
      const records = state.attendance || [];
      if (!records.length) {
        return "No attendance records found. Add your enrolled courses in the **Academics** app to unlock real safe-miss computations!";
      }

      const summaries = records.map(r => {
        const safeMiss = Math.floor((r.attended - threshold * r.totalClasses) / threshold);
        const catchUp = Math.ceil((threshold * r.totalClasses - r.attended) / (1 - threshold));
        if (safeMiss >= 0) {
          return `- **${r.course}**: ${r.percentage}% attendance. You can safely miss **${safeMiss} lecture(s)** while maintaining ≥${Math.round(threshold*100)}%.`;
        } else {
          return `- **${r.course}**: ⚠️ **${r.percentage}% (Below ${Math.round(threshold*100)}%!)**. You must attend the next **${catchUp} consecutive lecture(s)** to restore your standing.`;
        }
      });

      return `### Attendance Standing (Threshold: ${Math.round(threshold*100)}%):\n\n${summaries.join('\n')}\n\n*Rule of thumb:* Never spend a safe miss unless preparing for an imminent midterm or recovering from illness!`;
    }

    // 3. GPA / Grades
    if (q.includes('gpa') || q.includes('grade') || q.includes('cgpa')) {
      const currentGpa = state.grades?.cgpa || '3.82';
      return `### Academic Performance & GPA Acceleration:\n\nYour current calculated Cumulative GPA is **${currentGpa}**.\n\n### 4 Levers to Raise Your GPA to 3.9+:\n1. **Focus on High-Credit Courses:** 4-credit foundational courses carry 2x the weight of 2-credit labs.\n2. **Front-Load Homework:** Aim for 95%+ on all problem sets and project milestones so exam day isn't high-stress.\n3. **Professor Office Hours:** Attend at least once every 3 weeks to clarify ambiguous rubric expectations.\n4. **Spaced Practice:** Shift from 8-hour pre-exam cramming to four 45-minute spaced retrieval sessions across the 2 weeks leading up to exams.`;
    }

    // 4. Tasks / Todo / Priority
    if (q.includes('task') || q.includes('todo') || q.includes('work') || q.includes('kanban')) {
      const pending = (state.kanbanCards || []).filter(t => t.column !== 'Done');
      if (!pending.length) {
        return "You have cleared all Kanban tasks! Excellent velocity. Consider setting a new research goal or spending 30 minutes in the **Notes & Flashcards** app.";
      }
      const high = pending.filter(t => t.priority === 'high');
      return `### Prioritized Work Matrix (${pending.length} pending tasks):\n\n**High Priority (Execute First):**\n${high.length ? high.map(t => `- **${t.title}** (Due: ${t.deadline || 'ASAP'})`).join('\n') : '• No urgent blockers!'}\n\n**Next in Line:**\n${pending.filter(t => t.priority !== 'high').slice(0, 4).map(t => `- ${t.title} (${t.priority} priority)`).join('\n')}\n\n*Action:* Open **Focus & Pomodoro** and launch a 25-minute sprint on your top priority.`;
    }

    // 5. Singular Value Decomposition (SVD)
    if (q.includes('svd') || q.includes('singular value') || q.includes('eigen')) {
      return `### Singular Value Decomposition (SVD) First-Principles Breakdown:\n\nAny real matrix $A \\in \\mathbb{R}^{m \\times n}$ can be factored as:\n\`\`\`text\nA = U Σ V^T\n\`\`\`\n\n### The Geometric Interpretation:\n1. **$V^T$ (Right Singular Vectors):** Performs an initial orthonormal rotation/reflection in the input space $\\mathbb{R}^n$.\n2. **$\\Sigma$ (Singular Values):** A diagonal matrix $\\text{diag}(\\sigma_1, \\sigma_2, \\dots)$ that stretches along the coordinate axes. The singular values are sorted: $\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge 0$.\n3. **$U$ (Left Singular Vectors):** Performs a second orthonormal rotation into the target space $\\mathbb{R}^m$.\n\n### High-Yield Applications:\n- **PCA (Principal Component Analysis):** SVD on the centered covariance matrix yields the principal eigenvectors without explicitly computing $X^T X$.\n- **Low-Rank Approximation (Eckart-Young-Mirsky Theorem):** Truncating to the top $k$ singular values gives the mathematically optimal rank-$k$ approximation under Frobenius norm.`;
    }

    // 6. Dynamic Programming (DP)
    if (q.includes('dp') || q.includes('dynamic programming')) {
      return `### 3 High-Yield Dynamic Programming (DP) Archetypes:\n\n1. **Coin Change (Unbounded Knapsack):**\n   - *State:* $dp[w] =$ minimum coins required to make amount $w$.\n   - *Recurrence:* $dp[w] = \\min_{c \\in coins} (dp[w - c] + 1)$.\n   - *Base Case:* $dp[0] = 0$; all other states initialized to $\\infty$.\n\n2. **Longest Common Subsequence (2D State Alignment):**\n   - *State:* $dp[i][j] =$ LCS of prefixes $S_1[0..i]$ and $S_2[0..j]$.\n   - *Recurrence:* If $S_1[i] == S_2[j]$, then $1 + dp[i-1][j-1]$; else $\\max(dp[i-1][j], dp[i][j-1])$.\n\n3. **House Robber (1D Non-Adjacent Selection):**\n   - *State:* $dp[i] =$ max loot up to house $i$.\n   - *Recurrence:* $dp[i] = \\max(dp[i-1], dp[i-2] + nums[i])$.\n\n*Mental Model:* Always identify: (1) Minimal State, (2) Base Cases, (3) Transition/Recurrence, (4) Topo-order of computation.`;
    }

    // 7. Cold Email
    if (q.includes('cold email') || q.includes('professor') || q.includes('research')) {
      return `### High-Conversion Research Cold Email Template:\n\n**Subject:** Potential Research Collaboration on [Specific Topic, e.g. Diffusion Models] - Alex [Your Major]\n\nDear Professor [Last Name],\n\nI recently read your paper on *[Specific Paper Title]* and found your insight on [1 specific technical detail from paper] fascinating.\n\nI am a sophomore majoring in Computer Science at [University]. Over the past semester, I built [Brief Project / Open Source repo], implementing [specific framework, e.g., PyTorch transformers]. I would love the opportunity to contribute to your lab's ongoing work on [Specific Lab Project].\n\nDo you have 15 minutes available next Tuesday or Thursday for a brief chat, or could you recommend 1 foundational paper I should study before applying to your lab?\n\nSincerely,\n**Alex**\n[GitHub / Portfolio Link]`;
    }

    // Default pedagogical response
    return `### Academic Coach Synthesis:\n\nYou asked: *"\\${query}"*\n\nHere is a structured first-principles analysis:\n\n1. **Core Concept Formulation:** Break the problem down into its fundamental definitions and assumptions. Avoid memorizing solutions; isolate what changes versus what remains invariant.\n2. **Boundary Conditions:** Test edge cases (empty set, zero, negative inputs, asymptotic infinity) to verify intuition.\n3. **Practical Application:** Build a minimal verifiable code snippet or 1-page summary to cement the neural pathway.\n\n*(Tip: Attach your timetable or Kanban tasks above, or configure a Gemini API key in settings for live multi-turn AI reasoning!)*`;
  },

  destroy() {
    this.container = null;
  }
};

export default aiBuddyApp;
