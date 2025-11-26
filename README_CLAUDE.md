# YNAB + Claude Code Integration

This repository contains tools to manage your YNAB budget through Claude Code or Claude Projects.

## ⚡ Quick Start

### 1. Get Your YNAB Access Token

Visit https://app.ynab.com/settings/developer and create a Personal Access Token.

### 2. Set Up Locally

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd YNAB

# Install dependencies
npm install

# Set your token (choose one method)

# Method A: Environment variable
export YNAB_ACCESS_TOKEN="your_token_here"

# Method B: Create .env file (recommended)
echo "YNAB_ACCESS_TOKEN=your_token_here" > .env

# Test the connection
npm run verify
```

### 3. Start Using YNAB with Claude

Once set up, you can ask Claude to help manage your budget:

```
"Show me my YNAB budgets"
"What are my recent transactions?"
"How much did I spend on groceries?"
"What's my checking account balance?"
"Give me a budget summary"
```

## 🛠️ Tools Available

### CLI Commands

```bash
# Verify connection
npm run verify

# List all budgets
npm run ynab:budgets

# Initialize Claude assistant
npm run ynab:claude

# Run any command
npm run ynab <command> [args]
```

### Direct Usage

```bash
node cli/ynab-cli.js budgets
node cli/ynab-cli.js accounts <budgetId>
node cli/ynab-cli.js transactions <budgetId> [limit]
node cli/ynab-cli.js categories <budgetId>
node cli/ynab-cli.js summary <budgetId>
```

## 📚 Documentation

- **[CLAUDE_USAGE.md](./CLAUDE_USAGE.md)** - Complete guide for using YNAB with Claude
- **[VERIFICATION.md](./VERIFICATION.md)** - Connection verification and troubleshooting
- **[cli/README.md](./cli/README.md)** - CLI tools reference

## 🔒 Security

- Your access token is stored in `.env` (git-ignored)
- Never commit your `.env` file or share your token
- You can revoke tokens anytime from YNAB settings

## 💡 Example Usage

### With Claude Code

Simply ask Claude in natural language:

**You:** "Claude, show me my budget summary"

**Claude:** *runs `npm run ynab:claude` and displays your budget information*

### With CLI

```bash
# Export your token
export YNAB_ACCESS_TOKEN="your_token"

# Get summary
node cli/ynab-cli.js summary <budgetId>

# View recent transactions
node cli/ynab-cli.js transactions <budgetId> 50

# Check categories
node cli/ynab-cli.js categories <budgetId>
```

## 🎯 What You Can Do

✅ View all budgets and accounts
✅ Track recent transactions
✅ Monitor category spending
✅ Check account balances
✅ Get monthly summaries
✅ Analyze spending patterns
✅ And more!

## 🚀 Use with Claude Desktop or Claude Projects

This toolkit works great with:

1. **Claude Desktop** - Chat with Claude about your budget
2. **Claude Projects** - Create a project with these tools
3. **Claude Code** - Integrate into your development workflow

## 📦 What's Included

```
YNAB/
├── cli/
│   ├── ynab-cli.js          # Full CLI tool
│   ├── claude-ynab.js       # Claude integration layer
│   └── README.md            # CLI documentation
├── verify-connection.js     # Connection tester
├── setup-claude.sh          # Setup script
├── CLAUDE_USAGE.md          # Usage guide
├── VERIFICATION.md          # Verification guide
└── .env.example             # Token template
```

## ❓ Troubleshooting

### "YNAB_ACCESS_TOKEN is required"
Set the environment variable or create a `.env` file with your token.

### "Cannot find package 'ynab'"
Run `npm install` to install dependencies.

### "API connection failed"
- Check your token is valid
- Ensure you have internet connectivity
- Try generating a new token from YNAB

### Network Issues in Sandboxed Environments
If using in a sandboxed environment (like some cloud IDEs), you may need to run these tools locally where you have internet access.

## 🤝 Contributing

This is a personal project based on the YNAB API Starter Kit. Feel free to customize it for your needs!

## 📄 License

Apache-2.0 (inherited from YNAB API Starter Kit)

---

**Ready to start?** Set your token and ask Claude to help manage your budget! 🎉
