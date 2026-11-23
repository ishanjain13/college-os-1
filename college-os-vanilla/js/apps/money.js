// COLLEGE OS - App: Expenses, Income & Monthly Student Budget

import store from '../state.js';
import { awardXP } from '../xpSystem.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import soundService from '../sound.js';
import ui from '../ui.js';
import { logActivity } from '../activity.js';

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

    // Build spending chart data per category
    const chartData = Object.keys(budgets).map(cat => {
      const spent = expenses
        .filter(e => e.type === 'expense' && e.category === cat)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      return {
        label: cat,
        value: Math.round(spent),
        color: spent > (budgets[cat] || 100) ? 'var(--os-error)' : 'var(--os-accent)'
      };
    });

    return `
      <div class="app-container">
        <!-- Header -->
        <div class="app-header">
          <div class="app-title-group">
            <h2>Financial Standards &amp; Budget</h2>
            <p>Track cash flow, control discretionary spending, and build financial agency.</p>
          </div>
          <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-edit-budgets">
              ${getIcon('settings', 'w-3.5 h-3.5')} Category Limits
            </button>
            <button class="btn btn-primary btn-sm" id="btn-add-expense">
              ${getIcon('plus', 'w-3.5 h-3.5')} Log Transaction
            </button>
          </div>
        </div>

        <!-- 3 Financial Metrics -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4);">
          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Monthly Inflow</span>
            <div style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-mono); color: var(--os-success); margin: 4px 0;">+$${totalIncome.toFixed(2)}</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Stipends &amp; Earnings</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Monthly Outflow</span>
            <div style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-mono); color: var(--os-error); margin: 4px 0;">-$${totalExpense.toFixed(2)}</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">${expenses.filter(e => e.type === 'expense').length} Expenses Logged</span>
          </div>

          <div class="card">
            <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: var(--os-text-subtle); text-transform: uppercase; font-weight: 700;">Net Balance</span>
            <div style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-mono); color: ${netSavings >= 0 ? '#ffffff' : 'var(--os-error)'}; margin: 4px 0;">$${netSavings.toFixed(2)}</div>
            <span style="font-size: 0.6875rem; color: var(--os-text-muted);">Retained Cash Flow</span>
          </div>
        </div>

        <!-- SVG Spending Chart -->
        <div class="card" style="padding: var(--space-3) var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; text-transform: uppercase; color: var(--os-text);">
              Category Spending Breakdown ($)
            </span>
          </div>
          ${ui.chart.bar({ data: chartData, height: 110, valueFormatter: v => `$${v}` })}
        </div>

        <!-- Expense Transactions & Budget breakdown -->
        <div style="display: grid; grid-template-columns: 3fr 2fr; gap: var(--space-4); flex: 1; min-height: 0;">
          <!-- Ledger -->
          <div class="card" style="display: flex; flex-direction: column;">
            <div class="card-header">
              <span class="card-title">Recent Transactions</span>
              <span style="font-size: 0.6875rem; color: var(--os-text-muted);">${expenses.length} Total</span>
            </div>
            ${expenses.length === 0 ? `
              <div style="text-align: center; padding: 24px; color: var(--os-text-muted); font-size: 0.75rem;">
                No transactions recorded yet. Click "+ Log Transaction" to begin tracking.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: var(--space-2); overflow-y: auto; flex: 1;">
                ${expenses.map(exp => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) var(--space-3); background: var(--os-bg-subtle); border-radius: var(--radius-md); border: 1px solid var(--os-border-subtle);">
                    <div>
                      <div style="font-weight: 600; font-size: 0.8125rem; color: var(--os-text);">${escapeHtml(exp.title)}</div>
                      <div style="font-size: 0.6875rem; color: var(--os-text-muted); font-family: var(--font-mono);">${exp.date} • ${escapeHtml(exp.category)}</div>
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
            `}
          </div>

          <!-- Category Budgets -->
          <div class="card" style="display: flex; flex-direction: column; overflow-y: auto;">
            <div class="card-header">
              <span class="card-title">Monthly Category Budgets</span>
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
      const categories = ['Food', 'Hostel', 'Travel', 'College', 'Shopping', 'Entertainment', 'Fitness', 'Other', 'Income'];
      ui.modal({
        title: 'Log Financial Transaction',
        width: '420px',
        contentHtml: `
          <div class="form-group">
            <label class="form-label">Transaction Description *</label>
            <input type="text" id="exp-title-input" class="form-input" placeholder="e.g. Textbooks & Engineering Supplies" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Amount ($) *</label>
              <input type="number" id="exp-amount-input" class="form-input" placeholder="0.00" step="0.01" />
            </div>
            <div class="form-group">
              <label class="form-label">Type</label>
              <select id="exp-type-select" class="form-select">
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="exp-cat-select" class="form-select">
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" id="exp-date-input" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
            </div>
          </div>
        `,
        confirmText: 'Save Transaction',
        onConfirm: (modalEl) => {
          const title = modalEl.querySelector('#exp-title-input')?.value.trim();
          const amount = parseFloat(modalEl.querySelector('#exp-amount-input')?.value);

          if (!title || isNaN(amount) || amount <= 0) {
            ui.toast({ title: 'Validation Error', message: 'Valid description and positive amount required.', type: 'error' });
            return false;
          }

          const type = modalEl.querySelector('#exp-type-select')?.value;
          const category = modalEl.querySelector('#exp-cat-select')?.value;
          const date = modalEl.querySelector('#exp-date-input')?.value || new Date().toISOString().split('T')[0];

          const newExp = {
            id: `exp-${Date.now()}`,
            title,
            amount,
            category: type === 'income' ? 'Income' : category,
            type,
            date
          };

          store.setExpenses(prev => [newExp, ...prev]);
          logActivity({
            appId: 'money',
            action: type === 'income' ? 'income_logged' : 'expense_logged',
            title: `Recorded ${type === 'income' ? 'Income' : 'Expense'}: ${title}`,
            details: `$${amount.toFixed(2)} (${category})`,
            xpEarned: 15
          });

          ui.toast({ title: 'Transaction Logged', message: `+15 XP! $${amount.toFixed(2)} recorded.`, type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Edit Category Budgets
    const editBudgetsBtn = container.querySelector('#btn-edit-budgets');
    editBudgetsBtn?.addEventListener('click', () => {
      const currentBudgets = store.get().budgets || {};
      ui.modal({
        title: 'Monthly Category Budget Limits',
        width: '460px',
        contentHtml: `
          <p style="font-size: 0.75rem; color: var(--os-text-muted); margin-bottom: var(--space-3);">
            Set maximum monthly spending allowances for each category:
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
            ${Object.entries(currentBudgets).map(([cat, val]) => `
              <div class="form-group">
                <label class="form-label">${cat} ($)</label>
                <input type="number" class="form-input modal-budget-val" data-cat-key="${cat}" value="${val}" min="0" />
              </div>
            `).join('')}
          </div>
        `,
        confirmText: 'Save Budget Limits',
        onConfirm: (modalEl) => {
          const newBudgets = {};
          modalEl.querySelectorAll('.modal-budget-val').forEach(input => {
            const key = input.getAttribute('data-cat-key');
            newBudgets[key] = Number(input.value) || 0;
          });
          store.setBudgets(newBudgets);
          ui.toast({ title: 'Budgets Updated', message: 'Category caps successfully updated.', type: 'success' });
          container.innerHTML = this.render();
          this.init(container);
        }
      });
    });

    // Delete expense
    container.querySelectorAll('[data-delete-exp]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-exp');
        ui.confirm({
          title: 'Delete Transaction?',
          message: 'Remove this financial record from your ledger?',
          confirmText: 'Delete',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            store.setExpenses(prev => prev.filter(e => e.id !== id));
            ui.toast({ title: 'Transaction Deleted', message: 'Ledger updated.', type: 'info' });
            container.innerHTML = this.render();
            this.init(container);
          }
        });
      });
    });
  },

  destroy() {}
};

export default moneyApp;
