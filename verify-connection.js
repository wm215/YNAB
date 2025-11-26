#!/usr/bin/env node

/**
 * YNAB Connection Verification Script
 *
 * This script verifies your YNAB API connection by:
 * 1. Checking if config.json is properly set up
 * 2. Testing the API connection if an access token is provided
 */

import * as ynab from 'ynab';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function verifyConnection() {
  console.log('🔍 YNAB Connection Verification\n');

  // Step 1: Check config.json
  console.log('1️⃣  Checking configuration...');
  let config;
  try {
    const configPath = join(__dirname, 'src', 'config.json');
    const configData = await readFile(configPath, 'utf-8');
    config = JSON.parse(configData);

    console.log('   ✓ Config file found');
    console.log(`   - Client ID: ${config.clientId}`);
    console.log(`   - Redirect URI: ${config.redirectUri}`);

    // Check if using default values
    const isDefaultConfig = config.redirectUri === 'https://ynab.github.io/ynab-api-starter-kit/';
    if (isDefaultConfig) {
      console.log('   ⚠️  WARNING: Using default configuration!');
      console.log('   You need to:');
      console.log('   1. Create an OAuth app at https://app.ynab.com/settings/developer');
      console.log('   2. Update src/config.json with your Client ID and Redirect URI\n');
    } else {
      console.log('   ✓ Custom configuration detected\n');
    }
  } catch (err) {
    console.error('   ✗ Error reading config:', err.message);
    process.exit(1);
  }

  // Step 2: Check for access token
  console.log('2️⃣  Checking for access token...');
  const token = process.env.YNAB_ACCESS_TOKEN;

  if (!token) {
    console.log('   ⚠️  No access token provided');
    console.log('   To test the API connection, run:');
    console.log('   YNAB_ACCESS_TOKEN=your_token node verify-connection.js\n');
    console.log('   You can get a token by:');
    console.log('   - Running the app (npm start) and authorizing with YNAB');
    console.log('   - Or creating a Personal Access Token at https://app.ynab.com/settings/developer\n');
    return;
  }

  console.log('   ✓ Access token found\n');

  // Step 3: Test API connection
  console.log('3️⃣  Testing API connection...');
  try {
    const ynabAPI = new ynab.API(token);
    const response = await ynabAPI.user.getUser();

    console.log('   ✓ Successfully connected to YNAB API!');
    console.log(`   - User ID: ${response.data.user.id}\n`);

    // Step 4: Get budgets
    console.log('4️⃣  Fetching budgets...');
    const budgetsResponse = await ynabAPI.budgets.getBudgets();
    const budgets = budgetsResponse.data.budgets;

    if (budgets.length === 0) {
      console.log('   ⚠️  No budgets found');
    } else {
      console.log(`   ✓ Found ${budgets.length} budget(s):`);
      budgets.forEach((budget, index) => {
        console.log(`   ${index + 1}. ${budget.name} (${budget.currency_format.iso_code})`);
      });
    }

    console.log('\n✅ YNAB connection verified successfully!');

  } catch (err) {
    console.error('   ✗ API connection failed');
    if (err.error) {
      console.error(`   Error: ${err.error.name} - ${err.error.detail}`);
    } else {
      console.error(`   Error: ${err.message}`);
    }
    console.log('\n   Possible issues:');
    console.log('   - Invalid or expired access token');
    console.log('   - Network connectivity problems');
    console.log('   - YNAB API service issues\n');
    process.exit(1);
  }
}

verifyConnection().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
