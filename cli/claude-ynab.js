#!/usr/bin/env node

/**
 * Claude YNAB Assistant
 *
 * This script is designed to be used with Claude Code or Claude Projects.
 * It provides a natural language interface to your YNAB budget.
 *
 * Setup:
 *   1. Set YNAB_ACCESS_TOKEN in your environment or .env file
 *   2. Ask Claude to help you manage your budget!
 *
 * Examples:
 *   "Show me my budgets"
 *   "What are my recent transactions?"
 *   "How much money do I have in my checking account?"
 *   "Show me my budget summary for this month"
 */

import * as ynab from 'ynab';

class ClaudeYNABAssistant {
  constructor(accessToken) {
    if (!accessToken) {
      throw new Error('YNAB_ACCESS_TOKEN is required');
    }
    this.api = new ynab.API(accessToken);
    this.cachedBudgets = null;
    this.defaultBudgetId = null;
  }

  async initialize() {
    // Load budgets and cache them
    const response = await this.api.budgets.getBudgets();
    this.cachedBudgets = response.data.budgets;

    // Use first budget as default
    if (this.cachedBudgets.length > 0) {
      this.defaultBudgetId = this.cachedBudgets[0].id;
    }

    return {
      budgets: this.cachedBudgets,
      defaultBudgetId: this.defaultBudgetId
    };
  }

  async executeCommand(command, params = {}) {
    switch (command) {
      case 'get_budgets':
        return await this.getBudgets();

      case 'get_accounts':
        return await this.getAccounts(params.budgetId || this.defaultBudgetId);

      case 'get_transactions':
        return await this.getTransactions(
          params.budgetId || this.defaultBudgetId,
          params
        );

      case 'get_categories':
        return await this.getCategories(params.budgetId || this.defaultBudgetId);

      case 'get_summary':
        return await this.getSummary(params.budgetId || this.defaultBudgetId);

      case 'get_month':
        return await this.getMonth(
          params.budgetId || this.defaultBudgetId,
          params.month
        );

      case 'add_transaction':
        return await this.addTransaction(
          params.budgetId || this.defaultBudgetId,
          params.transaction
        );

      case 'search_payees':
        return await this.searchPayees(
          params.budgetId || this.defaultBudgetId,
          params.query
        );

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  async getBudgets() {
    return {
      budgets: this.cachedBudgets,
      default: this.defaultBudgetId
    };
  }

  async getAccounts(budgetId) {
    const response = await this.api.accounts.getAccounts(budgetId);
    return {
      accounts: response.data.accounts.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: this.formatCurrency(a.balance),
        balanceMilliunits: a.balance,
        onBudget: a.on_budget,
        closed: a.closed
      }))
    };
  }

  async getTransactions(budgetId, options = {}) {
    const limit = options.limit || 20;
    const accountId = options.accountId || null;
    const categoryId = options.categoryId || null;
    const since = options.since || null;

    let transactions;

    if (accountId) {
      const response = await this.api.transactions.getTransactionsByAccount(
        budgetId,
        accountId,
        since
      );
      transactions = response.data.transactions;
    } else if (categoryId) {
      const response = await this.api.transactions.getTransactionsByCategory(
        budgetId,
        categoryId,
        since
      );
      transactions = response.data.transactions;
    } else {
      const response = await this.api.transactions.getTransactions(budgetId, since);
      transactions = response.data.transactions;
    }

    // Filter and sort
    transactions = transactions
      .filter(t => t.approved && !t.deleted)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        date: t.date,
        amount: this.formatCurrency(t.amount),
        amountMilliunits: t.amount,
        payee: t.payee_name,
        category: t.category_name,
        account: t.account_name,
        memo: t.memo,
        cleared: t.cleared,
        approved: t.approved
      })),
      count: transactions.length
    };
  }

  async getCategories(budgetId) {
    const response = await this.api.categories.getCategories(budgetId);

    const categories = response.data.category_groups
      .filter(g => !g.hidden && !g.deleted)
      .map(group => ({
        groupName: group.name,
        groupId: group.id,
        categories: group.categories
          .filter(c => !c.hidden && !c.deleted)
          .map(c => ({
            id: c.id,
            name: c.name,
            budgeted: this.formatCurrency(c.budgeted),
            activity: this.formatCurrency(c.activity),
            balance: this.formatCurrency(c.balance),
            budgetedMilliunits: c.budgeted,
            activityMilliunits: c.activity,
            balanceMilliunits: c.balance
          }))
      }));

    return { categoryGroups: categories };
  }

  async getSummary(budgetId) {
    const [budgetResponse, accountsResponse, monthResponse] = await Promise.all([
      this.api.budgets.getBudgetById(budgetId),
      this.api.accounts.getAccounts(budgetId),
      this.api.months.getCurrentMonth(budgetId)
    ]);

    const budget = budgetResponse.data.budget;
    const accounts = accountsResponse.data.accounts;
    const month = monthResponse.data.month;

    const totalBalance = accounts
      .filter(a => !a.closed && a.on_budget)
      .reduce((sum, a) => sum + a.balance, 0);

    return {
      budget: {
        name: budget.name,
        currency: budget.currency_format.iso_code,
        lastModified: budget.last_modified_on
      },
      currentMonth: {
        income: this.formatCurrency(month.income),
        budgeted: this.formatCurrency(month.budgeted),
        activity: this.formatCurrency(month.activity),
        toBeBudgeted: this.formatCurrency(month.to_be_budgeted),
        incomeMilliunits: month.income,
        budgetedMilliunits: month.budgeted,
        activityMilliunits: month.activity,
        toBeBudgetedMilliunits: month.to_be_budgeted
      },
      accounts: accounts
        .filter(a => !a.closed)
        .map(a => ({
          name: a.name,
          balance: this.formatCurrency(a.balance),
          onBudget: a.on_budget
        })),
      totalBalance: this.formatCurrency(totalBalance)
    };
  }

  async getMonth(budgetId, month = 'current') {
    const response = month === 'current'
      ? await this.api.months.getCurrentMonth(budgetId)
      : await this.api.months.getBudgetMonth(budgetId, month);

    const monthData = response.data.month;

    return {
      month: monthData.month,
      income: this.formatCurrency(monthData.income),
      budgeted: this.formatCurrency(monthData.budgeted),
      activity: this.formatCurrency(monthData.activity),
      toBeBudgeted: this.formatCurrency(monthData.to_be_budgeted),
      ageOfMoney: monthData.age_of_money,
      categories: monthData.categories.map(c => ({
        name: c.name,
        budgeted: this.formatCurrency(c.budgeted),
        activity: this.formatCurrency(c.activity),
        balance: this.formatCurrency(c.balance)
      }))
    };
  }

  async addTransaction(budgetId, transactionData) {
    const transaction = {
      account_id: transactionData.accountId,
      date: transactionData.date || new Date().toISOString().split('T')[0],
      amount: Math.round(transactionData.amount * 1000),
      payee_name: transactionData.payee,
      category_id: transactionData.categoryId || null,
      memo: transactionData.memo || null,
      approved: transactionData.approved !== false
    };

    const response = await this.api.transactions.createTransaction(budgetId, {
      transaction
    });

    return {
      success: true,
      transaction: {
        id: response.data.transaction.id,
        date: response.data.transaction.date,
        amount: this.formatCurrency(response.data.transaction.amount),
        payee: response.data.transaction.payee_name
      }
    };
  }

  async searchPayees(budgetId, query) {
    const response = await this.api.payees.getPayees(budgetId);
    const payees = response.data.payees;

    const matches = payees.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    return {
      payees: matches.map(p => ({
        id: p.id,
        name: p.name,
        transferAccountId: p.transfer_account_id
      }))
    };
  }

  formatCurrency(milliunits) {
    const amount = milliunits / 1000;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

// Export for use in scripts
export default ClaudeYNABAssistant;

// CLI mode
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const token = process.env.YNAB_ACCESS_TOKEN;

  if (!token) {
    console.error('❌ YNAB_ACCESS_TOKEN environment variable required');
    console.log('\nGet your token from: https://app.ynab.com/settings/developer');
    process.exit(1);
  }

  const assistant = new ClaudeYNABAssistant(token);

  assistant.initialize().then(async (init) => {
    console.log('🤖 Claude YNAB Assistant initialized\n');
    console.log(`Found ${init.budgets.length} budget(s)`);

    if (init.budgets.length > 0) {
      console.log(`Default budget: ${init.budgets[0].name}\n`);

      // Show a quick summary
      const summary = await assistant.getSummary(init.defaultBudgetId);
      console.log('Current Month Summary:');
      console.log(`  Income: ${summary.currentMonth.income}`);
      console.log(`  Budgeted: ${summary.currentMonth.budgeted}`);
      console.log(`  Activity: ${summary.currentMonth.activity}`);
      console.log(`  To Be Budgeted: ${summary.currentMonth.toBeBudgeted}`);
      console.log(`  Total Balance: ${summary.totalBalance}\n`);

      console.log('✓ Ready for Claude to manage your budget!');
      console.log('  Claude can now help you with transactions, budgets, and more.\n');
    }
  }).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

// For ESM compatibility
import { fileURLToPath } from 'url';
