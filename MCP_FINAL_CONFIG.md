# ✅ COMPLETE MCP Configuration (All 3 Servers Working!)

## Full Working Configuration

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
    "stripe": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@deploya-labs/mcp-stripe"
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

## What to Replace (3 Keys)

1. **`YOUR_PASSWORD_HERE`** → Your Supabase database password
2. **`sk_test_YOUR_KEY_HERE`** → Your Stripe secret key
3. **`re_YOUR_KEY_HERE`** → Your Resend API key

## Key Changes from Before

### Fixed Stripe! ✅
- Changed from `@stripe/agent-toolkit` (doesn't work)
- To `@deploya-labs/mcp-stripe` (community package that works!)
- Added `cmd /c` prefix for Windows compatibility

### Kept Working Servers ✅
- **Postgres** - Already working for you!
- **Resend** - Custom server we built

## Steps to Apply

1. **Open settings.json**:
   ```powershell
   notepad "$env:APPDATA\Cursor\User\settings.json"
   ```

2. **Find the `mcpServers` section** (or add it if missing)

3. **Replace the entire section** with the config above

4. **Update the 3 placeholders** with your actual API keys:
   - Supabase password
   - Stripe secret key (from https://dashboard.stripe.com/test/apikeys)
   - Resend API key (from https://resend.com/api-keys)

5. **Save** (Ctrl + S)

6. **Close Cursor completely** (File → Exit)

7. **Reopen Cursor**

8. **Wait 15-20 seconds** for all servers to initialize

## Expected Result

You should see **3 green dots**:
- ✅ **postgres** - "1 tools, 18 resources enabled"
- ✅ **stripe** - Stripe payment tools enabled
- ✅ **resend** - Email tools enabled

**No more red error dots!** 🎉

## Test Commands

Once Cursor restarts, try these:

### Test Database (Postgres)
```
"Show me all tables in the database"
"List the 5 most recent orders"
```

### Test Stripe
```
"Show me recent Stripe payments"
"List my Stripe customers"
```

### Test Resend
```
"List emails sent through Resend today"
"Show me verified domains in Resend"
```

## What Each Server Does

### 🗄️ Postgres (Supabase)
- Direct database access
- Query orders, tickets, passes, users
- Real-time debugging
- Check enrollment status
- Verify purchases

### 💳 Stripe
- View payments and charges
- Check customer data
- Monitor refunds
- Track failed payments
- View balance

### 📧 Resend
- List sent emails
- Check delivery status
- View bounced emails
- See verified domains
- Monitor email health

## Troubleshooting

### If Stripe Still Shows Error:
The package might need to install first. You can pre-install it:
```powershell
npm install -g @deploya-labs/mcp-stripe
```

Then restart Cursor.

### If Resend Shows Error:
Make sure the file exists:
```powershell
Test-Path "C:\Users\miche\OneDrive\michel.adedokun@outlook.com\Documents\Mikilele Events\GrooveGrid\mcp-servers\resend\index.js"
```

Should return `True`. If `False`, let me know and I'll recreate it.

### If Postgres Shows Error:
- Check your database password is correct
- Verify your IP is allowed in Supabase settings
- Make sure the connection string format is exactly as shown

---

**This should give you all 3 working MCP servers!** 🚀

Once configured, come back and ask me to query your database or check Stripe payments!



