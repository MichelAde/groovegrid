# ✅ WORKING MCP Configuration (Simplified)

## The Issue
- Stripe doesn't have a working MCP server yet (`@stripe/agent-toolkit mcp` doesn't work)
- Let's use what DOES work: Postgres (Supabase) + Resend

## Working Configuration

Open your settings: `%APPDATA%\Cursor\User\settings.json`

**Replace your entire `mcpServers` section with this:**

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

## What to Replace

1. **`YOUR_PASSWORD_HERE`** → Your Supabase database password
2. **`re_YOUR_KEY_HERE`** → Your Resend API key

## What This Gives You

### ✅ Postgres (Supabase Database)
- Query all tables directly
- Check orders, tickets, passes, enrollments
- Real-time debugging
- **This is already working for you!** (Shows "1 tools, 18 resources enabled")

### ✅ Resend (Email Monitoring)
- List sent emails
- Check delivery status
- View bounced emails
- List verified domains

### ❌ Stripe (Not Available Yet)
- No official MCP server exists
- You can still check Stripe manually via dashboard
- Or I can help you create a custom Stripe MCP server later

## Steps to Fix

1. **Copy the configuration above**
2. **Open settings.json**:
   ```powershell
   notepad "$env:APPDATA\Cursor\User\settings.json"
   ```
3. **Replace the entire `mcpServers` section**
4. **Update the 2 placeholders** with your actual keys
5. **Save** (Ctrl + S)
6. **Close Cursor completely**
7. **Reopen Cursor**
8. **Wait 15 seconds**

## Expected Result

You should see **2 green dots**:
- ✅ **postgres** - "1 tools, 18 resources enabled"
- ✅ **resend** - Ready

**No more errors!** 🎉

## Test It

Once Cursor restarts, ask me:
```
"Show me all tables in the database"
```

Or:
```
"List emails sent through Resend in the last 24 hours"
```

## Want Stripe Too?

If you really need Stripe MCP access, I can create a **custom Stripe MCP server** similar to the Resend one. It would let me:
- Query Stripe payments
- Check customer data
- View charges and refunds
- Monitor webhooks

Just let me know and I'll build it! For now, let's get the working servers up and running first.

---

**Bottom line:** Use Postgres + Resend for now. Both are proven and working. Skip Stripe until we build a custom server for it.

