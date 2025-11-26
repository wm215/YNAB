# YNAB Connection Verification

## Current Status

**⚠️ NOT CONNECTED** - The application is using default configuration and has not been set up yet.

## What This Means

Your YNAB API Starter Kit is not currently connected to your personal YNAB account. The app is configured with default/demo credentials from the YNAB repository.

## How to Connect Your YNAB Account

### Option 1: Full OAuth Setup (Recommended for Web Apps)

1. **Create a YNAB OAuth Application**
   - Log into your YNAB account at https://app.ynab.com/users/authentication
   - Go to Developer Settings: https://app.ynab.com/settings/developer
   - Click "New Application"
   - Fill in the required information:
     - **Name**: Your app name (e.g., "My YNAB Budget Tracker")
     - **Description**: What your app does
     - **Website URL**: Your GitHub Pages URL
     - **Redirect URI**: `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/`

2. **Update Configuration**
   - Copy your **Client ID** from the YNAB Developer Settings
   - Edit `src/config.json`:
     ```json
     {
       "clientId": "YOUR_CLIENT_ID_HERE",
       "redirectUri": "https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/"
     }
     ```

3. **Deploy and Authorize**
   - Commit and push your changes to trigger GitHub Actions deployment
   - Visit your deployed app URL
   - Click "Authorize This App With YNAB"
   - Grant access to your YNAB data

### Option 2: Personal Access Token (For Testing/Development)

1. **Generate a Personal Access Token**
   - Go to https://app.ynab.com/settings/developer
   - Scroll to "Personal Access Tokens"
   - Click "New Token"
   - Give it a name and generate

2. **Test the Connection**
   ```bash
   YNAB_ACCESS_TOKEN=your_token_here node verify-connection.js
   ```

   This will verify your token and display your budgets.

## Running the Verification Script

After setting up your credentials, you can verify the connection:

```bash
# Check configuration only
node verify-connection.js

# Check configuration and test API connection
YNAB_ACCESS_TOKEN=your_token node verify-connection.js
```

## Current Configuration Status

- **Client ID**: `a56948bc5fe6e80c1a241151611a53350518c119ea413de4375694ebebbd68e0`
- **Redirect URI**: `https://ynab.github.io/ynab-api-starter-kit/`
- **Status**: ⚠️ Using default configuration (not personalized)

## Troubleshooting

### "No access token provided"
- You need to either:
  1. Run the app and authorize with YNAB (for OAuth flow)
  2. Create a Personal Access Token and provide it to the verification script

### "API connection failed"
- Check if your access token is valid and not expired
- Verify your YNAB account is active
- Check your network connection
- Ensure the token has the necessary permissions

### "Using default configuration"
- You haven't set up your own OAuth application yet
- Follow Option 1 above to create your own OAuth app

## Need Help?

- 📖 [YNAB API Documentation](https://api.ynab.com/)
- 💬 Contact YNAB API Support: api@ynab.com
- 📋 [YNAB API Starter Kit README](./README.md)
