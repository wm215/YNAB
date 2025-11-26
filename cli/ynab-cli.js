#!/usr/bin/env node

/**
 * YNAB CLI - Command Line Interface for YNAB API
 *
 * This tool allows you to interact with your YNAB budgets through Claude Code
 * or any command line interface.
 *
 * Usage:
 *   YNAB_ACCESS_TOKEN=your_token node cli/ynab-cli.js <command> [options]
 *
 * Commands:
 *   budgets              List all budgets
 *   accounts <budgetId>  List all accounts in a budget
 *   transactions <budgetId> [options]  List transactions
 *   categories <budgetId>  List categories
 *   add-transaction <budgetId>  Add a new transaction
 *   summary <budgetId>   Get budget summary
 *   interactive          Start interactive mode
 */

import * as ynab from 'ynab';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class YNABCli {
  constructor(accessToken) {
    if (!accessToken) {
      throw new Error('YNAB_ACCESS_TOKEN environment variable is required');
    }
    this.api = new ynab.API(accessToken);
  }

  async listBudgets() {
    console.log('📊 Fetching your budgets...\n');
    const response = await this.api.budgets.getBudgets();
    const budgets = response.data.budgets;

    if (budgets.length === 0) {
      console.log('No budgets found.');
      return;
    }

    console.log(`Found ${budgets.length} budget(s):\n`);
    budgets.forEach((budget, index) => {
      console.log(`${index + 1}. ${budget.name}`);
      console.log(`   ID: ${budget.id}`);
      console.log(`   Currency: ${budget.currency_format.iso_code}`);
      console.log(`   Last Modified: ${budget.last_modified_on}\n`);
    });
  }

  async listAccounts(budgetId) {
    console.log(`💳 Fetching accounts for budget ${budgetId}...\n`);
    const response = await this.api.accounts.getAccounts(budgetId);
    const accounts = response.data.accounts;

    if (accounts.length === 0) {
      console.log('No accounts found.');
      return;
    }

    console.log(`Found ${accounts.length} account(s):\n`);
    accounts.forEach((account, index) => {
      const balance = this.formatCurrency(account.balance);
      const onBudget = account.on_budget ? '✓' : '✗';
      console.log(`${index + 1}. ${account.name}`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Type: ${account.type}`);
      console.log(`   Balance: ${balance}`);
      console.log(`   On Budget: ${onBudget}`);
      console.log(`   Closed: ${account.closed ? 'Yes' : 'No'}\n`);
    });
  }

  async listTransactions(budgetId, options = {}) {
    const limit = options.limit || 20;
    const since = options.since || null;

    console.log(`💸 Fetching recent transactions...\n`);
    const response = await this.api.transactions.getTransactions(budgetId, since);
    let transactions = response.data.transactions;

    // Filter approved transactions and sort by date (newest first)
    transactions = transactions
      .filter(t => t.approved)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    if (transactions.length === 0) {
      console.log('No transactions found.');
      return;
    }

    console.log(`Showing ${transactions.length} most recent transactions:\n`);
    transactions.forEach((t, index) => {
      const amount = this.formatCurrency(t.amount);
      const indicator = t.amount >= 0 ? '+' : '';
      console.log(`${index + 1}. ${t.date} | ${indicator}${amount} | ${t.payee_name || 'Unknown'}`);
      console.log(`   Account: ${t.account_name}`);
      if (t.category_name) {
        console.log(`   Category: ${t.category_name}`);
      }
      if (t.memo) {
        console.log(`   Memo: ${t.memo}`);
      }
      console.log();
    });
  }

  async listCategories(budgetId) {
    console.log(`📑 Fetching categories...\n`);
    const response = await this.api.categories.getCategories(budgetId);
    const categoryGroups = response.data.category_groups;

    categoryGroups.forEach((group) => {
      if (group.hidden || group.deleted) return;

      console.log(`\n${group.name}`);
      console.log('─'.repeat(50));

      group.categories.forEach((category) => {
        if (category.hidden || category.deleted) return;

        const budgeted = this.formatCurrency(category.budgeted);
        const activity = this.formatCurrency(category.activity);
        const balance = this.formatCurrency(category.balance);

        console.log(`  ${category.name}`);
        console.log(`    Budgeted: ${budgeted} | Activity: ${activity} | Balance: ${balance}`);
      });
    });
    console.log();
  }

  async getSummary(budgetId) {
    console.log(`📈 Fetching budget summary...\n`);

    const [budgetResponse, accountsResponse, monthResponse] = await Promise.all([
      this.api.budgets.getBudgetById(budgetId),
      this.api.accounts.getAccounts(budgetId),
      this.api.months.getCurrentMonth(budgetId)
    ]);

    const budget = budgetResponse.data.budget;
    const accounts = accountsResponse.data.accounts;
    const month = monthResponse.data.month;

    // Calculate total balances
    const totalBalance = accounts
      .filter(a => !a.closed && a.on_budget)
      .reduce((sum, a) => sum + a.balance, 0);

    console.log(`Budget: ${budget.name}`);
    console.log(`Currency: ${budget.currency_format.iso_code}\n`);

    console.log('Current Month Summary:');
    console.log('─'.repeat(50));
    console.log(`Income: ${this.formatCurrency(month.income)}`);
    console.log(`Budgeted: ${this.formatCurrency(month.budgeted)}`);
    console.log(`Activity: ${this.formatCurrency(month.activity)}`);
    console.log(`To Be Budgeted: ${this.formatCurrency(month.to_be_budgeted)}\n`);

    console.log('Account Balances:');
    console.log('─'.repeat(50));
    accounts
      .filter(a => !a.closed)
      .forEach(a => {
        const balance = this.formatCurrency(a.balance);
        console.log(`${a.name}: ${balance}`);
      });
    console.log(`\nTotal (On Budget): ${this.formatCurrency(totalBalance)}\n`);
  }

  async addTransaction(budgetId, transactionData) {
    console.log(`➕ Adding transaction...\n`);

    const transaction = {
      account_id: transactionData.accountId,
      date: transactionData.date || new Date().toISOString().split('T')[0],
      amount: Math.round(transactionData.amount * 1000), // Convert to milliunits
      payee_name: transactionData.payee,
      category_id: transactionData.categoryId || null,
      memo: transactionData.memo || null,
      approved: true
    };

    const response = await this.api.transactions.createTransaction(budgetId, {
      transaction
    });

    const created = response.data.transaction;
    console.log('✓ Transaction created successfully!');
    console.log(`  ID: ${created.id}`);
    console.log(`  Date: ${created.date}`);
    console.log(`  Amount: ${this.formatCurrency(created.amount)}`);
    console.log(`  Payee: ${created.payee_name}\n`);
  }

  formatCurrency(milliunits) {
    const amount = milliunits / 1000;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  async interactive() {
    console.log('🤖 YNAB Interactive Mode\n');
    console.log('This mode allows Claude to interact with your YNAB budget.');
    console.log('Available commands: budgets, accounts, transactions, categories, summary\n');

    // List budgets first
    await this.listBudgets();

    console.log('Copy your budget ID and use it with other commands.');
    console.log('Example: node cli/ynab-cli.js accounts <budgetId>\n');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const token = process.env.YNAB_ACCESS_TOKEN;

  if (!token) {
    console.error('❌ Error: YNAB_ACCESS_TOKEN environment variable is required\n');
    console.log('Get your token from: https://app.ynab.com/settings/developer\n');
    console.log('Usage: YNAB_ACCESS_TOKEN=your_token node cli/ynab-cli.js <command>\n');
    process.exit(1);
  }

  const cli = new YNABCli(token);

  try {
    switch (command) {
      case 'budgets':
        await cli.listBudgets();
        break;

      case 'accounts':
        if (!args[1]) {
          console.error('❌ Budget ID required. Usage: accounts <budgetId>');
          process.exit(1);
        }
        await cli.listAccounts(args[1]);
        break;

      case 'transactions':
        if (!args[1]) {
          console.error('❌ Budget ID required. Usage: transactions <budgetId> [limit]');
          process.exit(1);
        }
        const limit = args[2] ? parseInt(args[2]) : 20;
        await cli.listTransactions(args[1], { limit });
        break;

      case 'categories':
        if (!args[1]) {
          console.error('❌ Budget ID required. Usage: categories <budgetId>');
          process.exit(1);
        }
        await cli.listCategories(args[1]);
        break;

      case 'summary':
        if (!args[1]) {
          console.error('❌ Budget ID required. Usage: summary <budgetId>');
          process.exit(1);
        }
        await cli.getSummary(args[1]);
        break;

      case 'interactive':
        await cli.interactive();
        break;

      default:
        console.log('YNAB CLI - Command Line Interface for YNAB\n');
        console.log('Available commands:');
        console.log('  budgets                    List all budgets');
        console.log('  accounts <budgetId>        List all accounts');
        console.log('  transactions <budgetId> [limit]  List recent transactions');
        console.log('  categories <budgetId>      List categories');
        console.log('  summary <budgetId>         Get budget summary');
        console.log('  interactive                Start interactive mode\n');
        console.log('Usage: YNAB_ACCESS_TOKEN=your_token node cli/ynab-cli.js <command>\n');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.error) {
      console.error(`   ${error.error.name}: ${error.error.detail}`);
    }
    process.exit(1);
  }
}

main();
