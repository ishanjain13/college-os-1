// COLLEGE OS - App: Expenses, Income & Monthly Student Budget

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';

export const moneyApp = {
  id: 'money',
  title: 'Expenses & Budget',
  icon: 'wallet',

  render() {
    const state = store.get();
    const expenses = state.expenses || [];
    const budgets = state.budgets || {};

    const totalExpense = expenses
      .filter(e => e.type === 'expense')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const netSavings = totalIncome - totalExpense;

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Financial Standards &amp; Budget</h2>
            <p>Track cash flow, control discretionary spending, and build financial agency.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-expense">
            ${getIcon('plus', 'w-3.5 h-3.5')} Log Expense
          </button>
        </div>

        <!-- 3 Financial Metrics -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Monthly Inflow</span>
            <div style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-mono); color: var(--os-success); margin: 4px 0;">+$${totalIncome.toFixed(2)}</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Stipends &amp; Grants</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Monthly Outflow</span>
            <div style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-mono); color: var(--os-error); margin: 4px 0;">-$${totalExpense.toFixed(2)}</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Total Expenses</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Net Balance</span>
            <div style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-mono); color: ${netSavings >= 0 ? '#ffffff' : 'var(--os-error)'}; margin: 4px 0;">$${netSavings.toFixed(2)}</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Retained Capital</span>
          </div>
        </div>

        <!-- Expense Transactions & Budget breakdown -->
        <div style="display: grid; grid-template-columns: 3fr 2fr; gap: var(--space-4);">
          <!-- Ledger -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Recent Transactions</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-2); max-height: 340px; overflow-y: auto;">
              ${expenses.map(exp => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) var(--space-3); background: var(--os-bg-subtle); border-radius: var(--radius-md);">
                  <div>
                    <div style="font-weight: 600; font-size: 0.8125rem;">${escapeHtml(exp.title)}</div>
                    <div style="font-size: 0.6875rem; color: var(--os-text-muted); font-family: var(--font-mono);">${exp.date} • ${exp.category}</div>
                  </div>
                  <div style="display: flex; align-items: center; gap: var(--space-3);">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: ${exp.type === 'income' ? 'var(--os-success)' : 'var(--os-text)'};">
                      ${exp.type === 'income' ? '+' : '-'}$${Number(exp.amount).toFixed(2)}
                    </span>
                    <button class="btn btn-ghost btn-xs" data-delete-exp="${exp.id}" title="Delete">×</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Category Budgets -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Category Budgets</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${Object.entries(budgets).map(([cat, limit]) => {
                const spent = expenses
                  .filter(e => e.type === 'expense' && e.category === cat)
                  .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
                const pct = Math.min(100, Math.round((spent / limit) * 100));

                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                      <span>${cat}</span>
                      <span style="font-family: var(--font-mono); font-weight: 600;">$${spent.toFixed(0)} / $${limit}</span>
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar-fill" style="width: ${pct}%; background: ${pct > 90 ? 'var(--os-error)' : 'var(--os-accent)'};"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init(container) {
    // Add Expense button
    const addBtn = container.querySelector('#btn-add-expense');
    addBtn?.addEventListener('click', () => {
      const title = prompt("Expense description:");
      if (!title) return;
      const amountStr = prompt("Amount ($):");
      const amount = parseFloat(amountStr);
      if (!amount) return;

      const newExp = {
        id: `exp-${Date.now()}`,
        title: title.trim(),
        amount: amount,
        category: 'Food',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      };

      store.setExpenses(prev => [newExp, ...prev]);
      awardXP(15, `Expense recorded: ${title}`);
      container.innerHTML = this.render();
      this.init(container);
    });

    // Delete expense
    container.querySelectorAll('[data-delete-exp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-exp');
        soundService.playClick();
        store.setExpenses(prev => prev.filter(e => e.id !== id));
        container.innerHTML = this.render();
        this.init(container);
      });
    });
  },

  destroy() {}
};

export default moneyApp;
