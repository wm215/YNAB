# Using YNAB with Claude Code & Claude Projects

This guide shows you how to operate your YNAB budget directly through Claude Code or Claude Projects.

## 🚀 Quick Start

### 1. Get Your YNAB Access Token

Go to https://app.ynab.com/settings/developer and create a Personal Access Token.

### 2. Set Up Your Environment

```bash
# Option A: Set environment variable (temporary)
export YNAB_ACCESS_TOKEN="your_token_here"

# Option B: Create a .env file (recommended)
echo "YNAB_ACCESS_TOKEN=your_token_here" > .env
```

### 3. Test the Connection

```bash
# Simple verification
YNAB_ACCESS_TOKEN=your_token node verify-connection.js

# Initialize Claude YNAB Assistant
YNAB_ACCESS_TOKEN=your_token node cli/claude-ynab.js
```

## 💬 Using with Claude Code

Once your token is set up, you can ask Claude to manage your YNAB budget naturally:

### Example Conversations

**You:** "Show me my YNAB budgets"
```bash
# Claude will run:
YNAB_ACCESS_TOKEN=$YNAB_ACCESS_TOKEN node cli/ynab-cli.js budgets
```

**You:** "What are my recent transactions?"
```bash
# Claude will get your budget ID and run:
YNAB_ACCESS_TOKEN=$YNAB_ACCESS_TOKEN node cli/ynab-cli.js transactions <budgetId>
```

**You:** "Show me a summary of my current budget"
```bash
# Claude will run:
YNAB_ACCESS_TOKEN=$YNAB_ACCESS_TOKEN node cli/ynab-cli.js summary <budgetId>
```

**You:** "How much do I have in my checking account?"
```bash
# Claude will:
# 1. Get your accounts
# 2. Find the checking account
# 3. Return the balance
```

**You:** "What did I spend on groceries this month?"
```bash
# Claude will:
# 1. Get your categories
# 2. Find the groceries category
# 3. Get transactions in that category
# 4. Calculate the total
```

## 🛠️ CLI Tools Reference

### ynab-cli.js - Direct Command Line Tool

Full-featured CLI for direct YNAB operations:

```bash
# List all budgets
node cli/ynab-cli.js budgets

# List accounts in a budget
node cli/ynab-cli.js accounts <budgetId>

# Show recent transactions (default: 20)
node cli/ynab-cli.js transactions <budgetId>
node cli/ynab-cli.js transactions <budgetId> 50  # Show 50 transactions

# List all categories
node cli/ynab-cli.js categories <budgetId>

# Get budget summary
node cli/ynab-cli.js summary <budgetId>

# Interactive mode
node cli/ynab-cli.js interactive
```

### claude-ynab.js - Claude Integration

Designed specifically for Claude Code integration:

```bash
# Initialize and show summary
node cli/claude-ynab.js

# Use programmatically (Claude can import this)
import ClaudeYNABAssistant from './cli/claude-ynab.js';

const assistant = new ClaudeYNABAssistant(process.env.YNAB_ACCESS_TOKEN);
await assistant.initialize();

// Get budgets
const budgets = await assistant.executeCommand('get_budgets');

// Get summary
const summary = await assistant.executeCommand('get_summary');

// Get transactions
const transactions = await assistant.executeCommand('get_transactions', {
  limit: 50,
  since: '2024-01-01'
});
```

## 🎯 Common Use Cases

### 1. Daily Budget Check

**You:** "Claude, check my budget status"

Claude will:
- Show your current month income, budgeted, and spending
- Display your account balances
- Calculate your total on-budget balance

### 2. Transaction Analysis

**You:** "Show me all my Starbucks purchases this month"

Claude will:
- Search transactions for "Starbucks"
- Calculate total spent
- Show individual transaction details

### 3. Category Monitoring

**You:** "How much have I spent on dining out?"

Claude will:
- Find the dining category
- Get the category activity
- Show remaining budget

### 4. Account Management

**You:** "What's my checking account balance?"

Claude will:
- List your accounts
- Find checking account
- Return current balance

### 5. Budget Planning

**You:** "Help me plan my budget for next month"

Claude will:
- Show current month categories
- Display spending patterns
- Help you allocate funds

## 🔧 Advanced Usage

### Custom Scripts

Create your own scripts that Claude can run:

```javascript
// my-ynab-report.js
import ClaudeYNABAssistant from './cli/claude-ynab.js';

const assistant = new ClaudeYNABAssistant(process.env.YNAB_ACCESS_TOKEN);
await assistant.initialize();

// Get summary
const summary = await assistant.getSummary();

// Get recent transactions
const transactions = await assistant.getTransactions({ limit: 100 });

// Generate custom report
console.log('Monthly Report');
console.log('Total Income:', summary.currentMonth.income);
console.log('Total Spending:', summary.currentMonth.activity);

// Find largest expenses
const sorted = transactions.transactions
  .filter(t => t.amountMilliunits < 0)
  .sort((a, b) => a.amountMilliunits - b.amountMilliunits)
  .slice(0, 10);

console.log('\nTop 10 Expenses:');
sorted.forEach(t => {
  console.log(`${t.date} - ${t.payee}: ${t.amount}`);
});
```

Then ask Claude:
**You:** "Run my monthly report"

### Automated Tasks

Create scripts for regular tasks:

```javascript
// check-overspending.js
import ClaudeYNABAssistant from './cli/claude-ynab.js';

const assistant = new ClaudeYNABAssistant(process.env.YNAB_ACCESS_TOKEN);
await assistant.initialize();

const categories = await assistant.getCategories();

console.log('Categories with Overspending:\n');

categories.categoryGroups.forEach(group => {
  group.categories.forEach(cat => {
    if (cat.balanceMilliunits < 0) {
      console.log(`⚠️  ${cat.name}: ${cat.balance}`);
    }
  });
});
```

## 📊 Data Format

All commands return structured data that Claude can easily parse and present:

```javascript
// Budget Summary
{
  budget: { name: "My Budget", currency: "USD" },
  currentMonth: {
    income: "$5,000.00",
    budgeted: "$4,800.00",
    activity: "-$3,200.00",
    toBeBudgeted: "$200.00"
  },
  totalBalance: "$12,500.00"
}

// Transactions
{
  transactions: [
    {
      date: "2024-01-15",
      amount: "-$45.00",
      payee: "Grocery Store",
      category: "Groceries",
      account: "Checking"
    }
  ]
}
```

## 🔒 Security Notes

1. **Never commit your access token** to git
2. Use environment variables or .env files
3. Add `.env` to your `.gitignore`
4. Tokens give full access to your budget - keep them secure
5. You can revoke tokens anytime from YNAB settings

## 🎓 Learning More

- **YNAB API Docs**: https://api.ynab.com/
- **YNAB SDK**: https://github.com/ynab/ynab-sdk-js
- **Claude Code Docs**: Ask Claude! "How do I use Claude Code?"

## 💡 Tips for Best Results

1. **Be specific**: "Show my grocery spending" works better than "show spending"
2. **Use natural language**: Claude understands conversational requests
3. **Ask for analysis**: "What category am I overspending on?"
4. **Request summaries**: "Give me a budget health check"
5. **Save common queries**: Create scripts for frequent tasks

## 🆘 Troubleshooting

### "YNAB_ACCESS_TOKEN is required"
Set your environment variable: `export YNAB_ACCESS_TOKEN="your_token"`

### "Cannot find package 'ynab'"
Run: `npm install`

### "Error: Invalid access token"
Your token may be expired. Generate a new one from YNAB settings.

### "Budget ID required"
First run `node cli/ynab-cli.js budgets` to get your budget ID.

---

**Ready to start?** Just ask Claude to help you manage your YNAB budget! 🎉
