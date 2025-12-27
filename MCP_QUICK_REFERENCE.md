# MCP Quick Reference Card

## Copy-Paste Ready Configuration

### Windows Cursor Settings Location
```
%APPDATA%\Cursor\User\settings.json
```

### Full MCP Configuration
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.bmdzerzampxetxmpmihv:[YOUR_SUPABASE_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    },
    "stripe": {
      "command": "npx",
      "args": [
        "-y",
        "stripe-mcp-server"
      ],
      "env": {
        "STRIPE_SECRET_KEY": "[YOUR_STRIPE_SECRET_KEY]"
      }
    },
    "resend": {
      "command": "node",
      "args": [
        "C:\\Users\\miche\\OneDrive\\michel.adedokun@outlook.com\\Documents\\Mikilele Events\\GrooveGrid\\mcp-servers\\resend\\index.js"
      ],
      "env": {
        "RESEND_API_KEY": "[YOUR_RESEND_API_KEY]"
      }
    }
  }
}
```

## Replace These Values

### Supabase
- Project Ref: `bmdzerzampxetxmpmihv` (already filled in)
- Password: Replace `[YOUR_SUPABASE_PASSWORD]`
- Get it from: https://supabase.com/dashboard/project/_/settings/database

### Stripe
- Replace `[YOUR_STRIPE_SECRET_KEY]`
- Format: `sk_test_...` (test) or `sk_live_...` (production)
- Get it from: https://dashboard.stripe.com/test/apikeys

### Resend
- Replace `[YOUR_RESEND_API_KEY]`
- Format: `re_...`
- Get it from: https://resend.com/api-keys

## Test Commands After Setup

Once configured and Cursor is restarted, ask me:

```
"Show me the 5 most recent orders from the database"
"List my Stripe payments from today"
"What emails were sent through Resend this week?"
```

## Troubleshooting Quick Fixes

### Can't find settings.json?
```powershell
# Run this in PowerShell to open it
notepad "$env:APPDATA\Cursor\User\settings.json"
```

### Resend MCP not working?
```powershell
# Verify the file exists
Test-Path "C:\Users\miche\OneDrive\michel.adedokun@outlook.com\Documents\Mikilele Events\GrooveGrid\mcp-servers\resend\index.js"
```

### Need to reinstall Resend MCP?
```powershell
cd "C:\Users\miche\OneDrive\michel.adedokun@outlook.com\Documents\Mikilele Events\GrooveGrid\mcp-servers\resend"
npm install
```

