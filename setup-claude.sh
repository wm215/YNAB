#!/bin/bash

# YNAB Claude Code Setup Script
# This script helps you set up YNAB integration with Claude Code

echo "🚀 YNAB Claude Code Setup"
echo "=========================="
echo ""

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Check for YNAB_ACCESS_TOKEN
if [ -z "$YNAB_ACCESS_TOKEN" ]; then
  echo "⚠️  YNAB_ACCESS_TOKEN not found in environment"
  echo ""
  echo "To get your token:"
  echo "1. Go to: https://app.ynab.com/settings/developer"
  echo "2. Create a Personal Access Token"
  echo "3. Run this script again with your token:"
  echo ""
  echo "   YNAB_ACCESS_TOKEN=your_token ./setup-claude.sh"
  echo ""
  echo "Or create a .env file:"
  echo "   echo 'YNAB_ACCESS_TOKEN=your_token' > .env"
  echo ""
  exit 1
fi

echo "✓ YNAB_ACCESS_TOKEN found"
echo ""

# Test the connection
echo "🔍 Testing YNAB connection..."
echo ""

node verify-connection.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Setup complete!"
  echo ""
  echo "You can now use YNAB with Claude Code!"
  echo ""
  echo "Try asking Claude:"
  echo "  • 'Show me my YNAB budgets'"
  echo "  • 'What are my recent transactions?'"
  echo "  • 'Give me a budget summary'"
  echo ""
  echo "Or run commands directly:"
  echo "  node cli/ynab-cli.js budgets"
  echo "  node cli/ynab-cli.js summary <budgetId>"
  echo ""
  echo "See CLAUDE_USAGE.md for more examples!"
  echo ""
else
  echo ""
  echo "❌ Connection test failed"
  echo ""
  echo "Please check:"
  echo "  • Your access token is valid"
  echo "  • You have an active YNAB account"
  echo "  • Your internet connection is working"
  echo ""
  exit 1
fi
