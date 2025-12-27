# 🚀 Copy-Paste MCP Configuration (FIXED)

## Step 1: Open Settings
Run this in PowerShell or Command Prompt:
```powershell
notepad "$env:APPDATA\Cursor\User\settings.json"
```

## Step 2: Replace `mcpServers` Section

Find the `"mcpServers": {` section and replace it with this:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.bmdzerzampxetxmpmihv:YOUR_PASSWORD_HERE@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
      ]
    },
    "stripe": {
      "command": "npx",
      "args": [
        "-y",
        "@stripe/agent-toolkit",
        "mcp"
      ],
      "env": {
        "STRIPE_SECRET_KEY": "sk_test_YOUR_KEY_HERE"
      }
    },
    "resend": {
      "command": "node",
      "args": [
        "C:\\Users\\miche\\OneDrive\\michel.adedokun@outlook.com\\Documents\\Mikilele Events\\GrooveGrid\\mcp-servers\\resend\\index.js"
      ],
      "env": {
        "RESEND_API_KEY": "re_YOUR_KEY_HERE"
      }
    }
  }
}
```

## Step 3: Replace These 3 Values

1. **`YOUR_PASSWORD_HERE`** → Your Supabase database password
2. **`sk_test_YOUR_KEY_HERE`** → Your Stripe secret key
3. **`re_YOUR_KEY_HERE`** → Your Resend API key

## Step 4: Save and Restart

1. Save the file (Ctrl + S)
2. Close Cursor completely
3. Reopen Cursor
4. Wait 15 seconds

## ✅ Expected Result

All 3 servers should show green dots:
- ✅ postgres (1 tools, 18 resources enabled)
- ✅ stripe
- ✅ resend

No more red error dots!

## Test Command

Once Cursor restarts, ask me:
```
"Show me the database tables"
```

I'll query your Supabase database directly! 🎉




