# YNAB CLI Tools

Command-line tools for interacting with your YNAB budget through Claude Code.

## Quick Start

1. Set your YNAB access token:
   ```bash
   export YNAB_ACCESS_TOKEN="your_token_here"
   ```

2. Run the setup script:
   ```bash
   ./setup-claude.sh
   ```

3. Start using YNAB with Claude!

## Tools

### ynab-cli.js
Full-featured command-line interface for YNAB operations.

```bash
# List budgets
node cli/ynab-cli.js budgets

# List accounts
node cli/ynab-cli.js accounts <budgetId>

# Show transactions
node cli/ynab-cli.js transactions <budgetId> [limit]

# List categories
node cli/ynab-cli.js categories <budgetId>

# Get summary
node cli/ynab-cli.js summary <budgetId>
```

### claude-ynab.js
Claude Code integration layer for natural language YNAB management.

```bash
# Initialize and show summary
node cli/claude-ynab.js
```

This tool is designed to be used programmatically by Claude to answer your questions about your budget.

## Documentation

See [../CLAUDE_USAGE.md](../CLAUDE_USAGE.md) for complete usage guide and examples.

## Examples

### Check your budget status
```bash
node cli/ynab-cli.js summary <budgetId>
```

### See recent spending
```bash
node cli/ynab-cli.js transactions <budgetId> 50
```

### View all categories
```bash
node cli/ynab-cli.js categories <budgetId>
```

## Using with Claude

Just ask Claude naturally:
- "Show me my YNAB budgets"
- "What are my recent transactions?"
- "How much did I spend on groceries?"
- "What's my checking account balance?"

Claude will use these tools to answer your questions!
